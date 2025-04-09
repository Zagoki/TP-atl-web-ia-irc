const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const axios = require('axios');
const { MongoClient, ObjectId } = require('mongodb');
const PROTO_PATH = './todo.proto';

// Chargement du fichier .proto
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const todoProto = grpc.loadPackageDefinition(packageDefinition).todo;

// Connexion à MongoDB
const url = 'mongodb://localhost:27017';
const dbName = 'grpcdb';
let db;

MongoClient.connect(url, (err, client) => {
  if (err) throw err;
  db = client.db(dbName);
  console.log('Connected to MongoDB');

  // Démarrage du serveur après la connexion à MongoDB
  const server = new grpc.Server();
  server.addService(todoProto.TodoService.service, { addTask, getTasks, getGames, addProduct, updateProduct, deleteProduct, getProducts });
  server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
    console.log('Server running on http://0.0.0.0:50051');
  });
});

// Implémentation des méthodes du service
const addTask = (call, callback) => {
  const task = call.request;
  tasks.push(task);
  callback(null, { message: 'Task added successfully!' });
};

const getTasks = (call, callback) => {
  callback(null, { tasks });
};

const getGames = async (call, callback) => {
  try {
    const response = await axios.get('https://www.freetogame.com/api/games');
    const games = response.data.map(game => ({
      id: game.id.toString(),
      title: game.title,
      genre: game.genre,
      platform: game.platform
    }));
    callback(null, { games });
  } catch (error) {
    callback(error);
  }
};

const addProduct = (call, callback) => {
  if (!db) {
    return callback(new Error('Database not connected'));
  }
  const product = call.request;
  db.collection('products').insertOne(product, (err, result) => {
    if (err) callback(err);
    else callback(null, { message: 'Product added successfully!' });
  });
};

const updateProduct = (call, callback) => {
  if (!db) {
    return callback(new Error('Database not connected'));
  }
  const product = call.request;
  const { id, ...updateFields } = product;
  db.collection('products').updateOne({ _id: ObjectId(id) }, { $set: updateFields }, (err, result) => {
    if (err) callback(err);
    else callback(null, { message: 'Product updated successfully!' });
  });
};

const deleteProduct = (call, callback) => {
  if (!db) {
    return callback(new Error('Database not connected'));
  }
  const { id } = call.request;
  db.collection('products').deleteOne({ _id: ObjectId(id) }, (err, result) => {
    if (err) callback(err);
    else callback(null, { message: 'Product deleted successfully!' });
  });
};

const getProducts = (call, callback) => {
  if (!db) {
    return callback(new Error('Database not connected'));
  }
  db.collection('products').find().toArray((err, products) => {
    if (err) callback(err);
    else callback(null, { products });
  });
};