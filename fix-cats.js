const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://romeoville:banku@cluster0.iszcnwu.mongodb.net/?retryWrites=true&w=majority')
  .then(async () => {
    const db = mongoose.connection.db;
    
    // Remove shop requirement from categories
    await db.collection('categories').updateMany({}, { $unset: { shop: "" } })
    
    console.log('Shop removed from categories');
    
    const cats = await db.collection('categories').find({}).toArray();
    console.log('Categories:', cats.length);
    cats.forEach(c => console.log('-', c.name));
    
    process.exit(0);
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });