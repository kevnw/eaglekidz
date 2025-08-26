// MongoDB initialization script for EagleKidz
db = db.getSiblingDB('eaglekidz');

// Create collections
db.createCollection('weeks');
db.createCollection('reviews');
db.createCollection('ministers');
db.createCollection('children');

// Create indexes for better performance
db.weeks.createIndex({ "start_date": 1 });
db.weeks.createIndex({ "end_date": 1 });
db.reviews.createIndex({ "week_id": 1 });
db.reviews.createIndex({ "created_at": -1 });
db.ministers.createIndex({ "first_name": 1 });
db.ministers.createIndex({ "last_name": 1 });
db.children.createIndex({ "first_name": 1 });
db.children.createIndex({ "last_name": 1 });
db.children.createIndex({ "age_group": 1 });

print('EagleKidz database initialized successfully!');