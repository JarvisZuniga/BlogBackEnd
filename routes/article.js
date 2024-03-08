'use strict'

const express = require('express');
const ArticleController = require('../controllers/article');
const router = express.Router();
const multer = require('multer');

// Configurar donde se van a subir los archivos y cómo se van a nombrar
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './upload/articles/')
    },
    filename: function (req, file, cb) {
        cb(null, "article" + Date.now() + file.originalname);
    }
});

// Crear el objeto multer y pasarle la configuración
const upload = multer({ storage: storage });
  

// Rutas de prueba
router.post('/datos-curso', ArticleController.datosCurso);
router.get('/test-de-controlador', ArticleController.test);

// Rutas útiles
router.post('/save', ArticleController.save);
router.get('/articles/:last?', ArticleController.getArticles);
router.get('/article/:id', ArticleController.getArticle);
router.put('/article/:id', ArticleController.update);
router.delete('/article/:id', ArticleController.delete);
router.post('/upload-image/:id?', upload.single('image'), ArticleController.upload);
router.get('/get-image/:image', ArticleController.getImage);
router.get('/search/:search', ArticleController.search);

module.exports = router;