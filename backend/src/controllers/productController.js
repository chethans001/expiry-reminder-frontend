const prisma = require('../config/db');
const { calculateExpiry } = require('../utils/calculateExpiry');

// 1. Get All Items for Current User (with search, filter, sort)
exports.getItems = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      search,
      category,
      location,
      status,
      favorite,
      trash,
      sort = 'expiryAsc'
    } = req.query;

    const isDeleted = trash === 'true';

    // Base filters
    const where = {
      userId,
      isDeleted
    };

    if (favorite === 'true') {
      where.isFavorite = true;
    }

    if (category) {
      const catId = parseInt(category, 10);
      if (!isNaN(catId)) {
        where.categoryId = catId;
      }
    }

    if (location && location !== 'All') {
      where.storageLocation = location;
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q } },
        { brand: { contains: q } },
        { notes: { contains: q } },
        { storageLocation: { contains: q } }
      ];
    }

    // Determine orderBy
    let orderBy = { expiryDate: 'asc' };
    if (sort === 'expiryDesc') orderBy = { expiryDate: 'desc' };
    else if (sort === 'nameAsc') orderBy = { name: 'asc' };
    else if (sort === 'nameDesc') orderBy = { name: 'desc' };
    else if (sort === 'newest') orderBy = { createdAt: 'desc' };
    else if (sort === 'frequent') orderBy = { useCount: 'desc' };

    const items = await prisma.product.findMany({
      where,
      orderBy,
      include: {
        category: true
      }
    });

    // Attach calculated smart expiry info to every item
    const enrichedItems = items.map(item => {
      const expiryInfo = calculateExpiry(item.expiryDate);
      return {
        ...item,
        ...expiryInfo
      };
    });

    // Filter by status if requested (Safe, Expiring Soon, Expiring Today, Expired)
    let filteredItems = enrichedItems;
    if (status && status !== 'all') {
      const s = status.toLowerCase();
      if (s === 'safe') filteredItems = enrichedItems.filter(i => i.status === 'Safe');
      else if (s === 'soon' || s === 'expiring-soon') filteredItems = enrichedItems.filter(i => i.status === 'Expiring Soon');
      else if (s === 'today' || s === 'expiring-today') filteredItems = enrichedItems.filter(i => i.status === 'Expiring Today');
      else if (s === 'expired') filteredItems = enrichedItems.filter(i => i.status === 'Expired');
    }

    return res.json({
      success: true,
      count: filteredItems.length,
      items: filteredItems
    });
  } catch (error) {
    console.error('Fetch items error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch items.' });
  }
};

// 2. Get Single Item Details
exports.getItemById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const item = await prisma.product.findFirst({
      where: { id, userId: req.user.id },
      include: {
        category: true,
        activityLogs: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    const expiryInfo = calculateExpiry(item.expiryDate);

    return res.json({
      success: true,
      item: {
        ...item,
        ...expiryInfo
      }
    });
  } catch (error) {
    console.error('Fetch single item error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch item details.' });
  }
};

// 3. Add Item
exports.createItem = async (req, res) => {
  try {
    const {
      name,
      categoryId,
      brand,
      quantity,
      unit,
      purchaseDate,
      manufacturingDate,
      expiryDate,
      storageLocation,
      notes,
      isFavorite
    } = req.body;

    if (!name || !categoryId || !expiryDate) {
      return res.status(400).json({
        success: false,
        message: 'Item name, category, and expiry date are required.'
      });
    }

    let imageUrl = req.body.imageUrl || null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const parsedCategoryId = parseInt(categoryId, 10);
    const parsedQuantity = quantity ? parseFloat(quantity) : 1;

    const newItem = await prisma.product.create({
      data: {
        userId: req.user.id,
        name: name.trim(),
        categoryId: parsedCategoryId,
        brand: brand ? brand.trim() : null,
        quantity: isNaN(parsedQuantity) ? 1 : parsedQuantity,
        unit: unit || 'pcs',
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        manufacturingDate: manufacturingDate ? new Date(manufacturingDate) : null,
        expiryDate: new Date(expiryDate),
        storageLocation: storageLocation || 'Kitchen',
        notes: notes ? notes.trim() : null,
        imageUrl,
        isFavorite: isFavorite === 'true' || isFavorite === true
      },
      include: {
        category: true
      }
    });

    // Log Activity
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        productId: newItem.id,
        action: 'CREATED',
        details: `Added "${newItem.name}" expiring on ${new Date(newItem.expiryDate).toLocaleDateString()}`
      }
    });

    const expiryInfo = calculateExpiry(newItem.expiryDate);

    return res.status(201).json({
      success: true,
      message: 'Item added successfully!',
      item: {
        ...newItem,
        ...expiryInfo
      }
    });
  } catch (error) {
    console.error('Create item error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create item.' });
  }
};

// 4. Update Item
exports.updateItem = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    const existing = await prisma.product.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    const {
      name,
      categoryId,
      brand,
      quantity,
      unit,
      purchaseDate,
      manufacturingDate,
      expiryDate,
      storageLocation,
      notes,
      isFavorite
    } = req.body;

    let imageUrl = existing.imageUrl;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.imageUrl !== undefined) {
      imageUrl = req.body.imageUrl;
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(categoryId && { categoryId: parseInt(categoryId, 10) }),
        ...(brand !== undefined && { brand: brand ? brand.trim() : null }),
        ...(quantity !== undefined && { quantity: parseFloat(quantity) }),
        ...(unit && { unit }),
        ...(purchaseDate !== undefined && { purchaseDate: purchaseDate ? new Date(purchaseDate) : null }),
        ...(manufacturingDate !== undefined && { manufacturingDate: manufacturingDate ? new Date(manufacturingDate) : null }),
        ...(expiryDate && { expiryDate: new Date(expiryDate) }),
        ...(storageLocation && { storageLocation }),
        ...(notes !== undefined && { notes: notes ? notes.trim() : null }),
        ...(isFavorite !== undefined && { isFavorite: isFavorite === 'true' || isFavorite === true }),
        imageUrl
      },
      include: {
        category: true
      }
    });

    // Log Activity
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        productId: updated.id,
        action: 'UPDATED',
        details: `Updated details for "${updated.name}"`
      }
    });

    const expiryInfo = calculateExpiry(updated.expiryDate);

    return res.json({
      success: true,
      message: 'Item updated successfully!',
      item: {
        ...updated,
        ...expiryInfo
      }
    });
  } catch (error) {
    console.error('Update item error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update item.' });
  }
};

// 5. Soft Delete Item (Move to Trash)
exports.deleteItem = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    const existing = await prisma.product.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    await prisma.product.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date()
      }
    });

    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        productId: id,
        action: 'DELETED',
        details: `Moved "${existing.name}" to Trash`
      }
    });

    return res.json({
      success: true,
      message: `"${existing.name}" moved to Trash. You can restore it anytime.`
    });
  } catch (error) {
    console.error('Delete item error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete item.' });
  }
};

// 6. Restore Item from Trash
exports.restoreItem = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    const existing = await prisma.product.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    await prisma.product.update({
      where: { id },
      data: {
        isDeleted: false,
        deletedAt: null
      }
    });

    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        productId: id,
        action: 'RESTORED',
        details: `Restored "${existing.name}" from Trash`
      }
    });

    return res.json({
      success: true,
      message: `"${existing.name}" restored successfully.`
    });
  } catch (error) {
    console.error('Restore item error:', error);
    return res.status(500).json({ success: false, message: 'Failed to restore item.' });
  }
};

// 7. Permanent Delete Item
exports.permanentDeleteItem = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    const existing = await prisma.product.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    await prisma.product.delete({
      where: { id }
    });

    return res.json({
      success: true,
      message: 'Item permanently deleted.'
    });
  } catch (error) {
    console.error('Permanent delete error:', error);
    return res.status(500).json({ success: false, message: 'Failed to permanently delete item.' });
  }
};

// 8. Toggle Favorite
exports.toggleFavorite = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    const existing = await prisma.product.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { isFavorite: !existing.isFavorite }
    });

    return res.json({
      success: true,
      isFavorite: updated.isFavorite,
      message: updated.isFavorite ? 'Added to favorites' : 'Removed from favorites'
    });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update favorite status.' });
  }
};

// 9. Increment Usage Count (Mark Used/Consumed)
exports.useItem = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    const updated = await prisma.product.update({
      where: { id },
      data: { useCount: { increment: 1 } }
    });

    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        productId: id,
        action: 'CONSUMED',
        details: `Used/consumed "${updated.name}" (Used ${updated.useCount} times)`
      }
    });

    return res.json({
      success: true,
      useCount: updated.useCount,
      message: `Used "${updated.name}".`
    });
  } catch (error) {
    console.error('Use item error:', error);
    return res.status(500).json({ success: false, message: 'Failed to record item use.' });
  }
};
