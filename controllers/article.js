'use strict'

var validator = require('validator');
var fs = require('fs');
var path = require('path');

var Article = require('../models/article');

const deleteFile = (filePath) => {
    fs.unlink(filePath, (err) => {
        if (err) {
            console.error('Error al eliminar el archivo:', err);
        } else {
            console.log('Archivo eliminado correctamente');
        }
    });
};

var controller = {

    datosCurso: (req, res) => {
        var hola = req.body.hola;
    
        return res.status(200).send({
            curso: 'Master en Frameworks JS',
            autor: 'Víctor Robles WEB',
            url: 'victorroblesweb.es',
            hola
        });
    },

    test: (req, res) => {
        return res.status(200).send({
            message: 'Soy la acción test de mi controlador de articulos'
        });
    },

    save: (req, res) => {
        // Recoger parametros por post
        var params = req.body;
    
        // Validar datos (validator)
        try {
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
    
        } catch(err) {
            return res.status(200).send({
                status: 'error',
                message: 'Faltan datos por enviar !!!'
            });
        }
    
        if (validate_title && validate_content) {
            
            //Crear el objeto a guardar
            var article = new Article();
    
            // Asignar valores
            article.title = params.title;
            article.content = params.content;
    
            // Verificar si se ha subido una imagen y asignarla al artículo
            if (req.file) {
                article.image = req.file.filename; // Guardar el nombre del archivo de la imagen
            }
    
            // Guardar el articulo
            article.save((err, articleStored) => {
    
                if (err || !articleStored) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'El articulo no se ha guardado !!!'
                    });
                }
    
                // Devolver una respuesta 
                return res.status(200).send({
                    status: 'success',
                    article: articleStored
                });
    
            });
    
        } else {
            return res.status(200).send({
                status: 'error',
                message: 'Los datos no son válidos !!!'
            });
        }
    },
    

    getArticles: (req, res) => {

        var query = Article.find({});

        var last = req.params.last;
        if(last || last != undefined){
            query.limit(5);
        }

        // Find
        query.sort('-_id').exec((err, articles) => {

            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al devolver los articulos !!!'
                });
            }

            if(!articles){
                return res.status(404).send({
                    status: 'error',
                    message: 'No hay articulos para mostrar !!!'
                });
            }

            return res.status(200).send({
                status: 'success',
                articles
            });

        });
    },

    getArticle: (req, res) => {

        // Recoger el id de la url
        var articleId = req.params.id;

        // Comprobar que existe
        if(!articleId || articleId == null){
            return res.status(404).send({
                status: 'error',
                message: 'No existe el articulo !!!'
            });
        }

        // Buscar el articulo
        Article.findById(articleId, (err, article) => {
            
            if(err || !article){
                return res.status(404).send({
                    status: 'error',
                    message: 'No existe el articulo !!!'
                });
            }

            // Devolverlo en json
            return res.status(200).send({
                status: 'success',
                article
            });

        });
    },

    update: (req, res) => {
        // Recoger el id del articulo por la url
        var articleId = req.params.id;

        // Recoger los datos que llegan por put
        var params = req.body;

        // Validar datos
        try{
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
        }catch(err){
            return res.status(200).send({
                status: 'error',
                message: 'Faltan datos por enviar !!!'
            }); 
        }

        if(validate_title && validate_content){
             // Find and update
             Article.findOneAndUpdate({_id: articleId}, params, {new:true}, (err, articleUpdated) => {
                if(err){
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al actualizar !!!'
                    });
                }

                if(!articleUpdated){
                    return res.status(404).send({
                        status: 'error',
                        message: 'No existe el articulo !!!'
                    });
                }

                return res.status(200).send({
                    status: 'success',
                    article: articleUpdated
                });
             });
        }else{
             // Devolver respuesta
            return res.status(200).send({
                status: 'error',
                message: 'La validación no es correcta !!!'
            });
        }
       
    },

    delete: (req, res) => {
        // Recoger el id de la url
        var articleId = req.params.id;

        // Find and delete
        Article.findOneAndDelete({_id: articleId}, (err, articleRemoved) => {
            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al borrar !!!'
                });
            }

            if(!articleRemoved){
                return res.status(404).send({
                    status: 'error',
                    message: 'No se ha borrado el articulo, posiblemente no exista !!!'
                });
            }

            return res.status(200).send({
                status: 'success',
                article: articleRemoved
            });

        }); 
    },

    upload: (req, res) => {
        // Verificar si se ha subido un archivo
        if (!req.file) {
            return res.status(400).send({
                status: 'error',
                message: 'No se ha subido ninguna imagen'
            });
        }
    
        // Verificar la extensión del archivo
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
        const fileExtension = path.extname(req.file.originalname).toLowerCase();
        if (!allowedExtensions.includes(fileExtension)) {
            // Eliminar el archivo no permitido
            deleteFile(req.file.path);
            
            return res.status(400).send({
                status: 'error',
                message: 'El formato del archivo no es compatible. Solo se permiten archivos .jpg, .jpeg, .png y .gif'
            });
        }
    
        // Obtener el nombre del archivo subido
        const fileName = req.file.filename;
    
        // Obtener el ID del artículo de la solicitud
        const articleId = req.params.id;
    
        // Buscar el artículo por su ID y actualizar el campo de imagen
        Article.findByIdAndUpdate(articleId, { image: fileName }, { new: true }, (err, updatedArticle) => {
            if (err || !updatedArticle) {
                // En caso de error, eliminar el archivo subido
                deleteFile(req.file.path);
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al actualizar el artículo con la imagen'
                });
            }
    
            // Devolver una respuesta exitosa
            return res.status(200).send({
                status: 'success',
                message: 'Imagen subida correctamente y guardada en el artículo',
                filename: fileName,
                article: updatedArticle
            });
        });
    }
    
    ,//fin upload

    getImage: (req, res) => {
        var file = req.params.image;
        var path_file = './upload/articles/'+file;

        fs.exists(path_file, (exists) => {
            if(exists){
                return res.sendFile(path.resolve(path_file));
            }else{
                return res.status(404).send({
                    status: 'error',
                    message: 'La imagen no existe !!!'
                });
            }
        });
    }, 

    search: (req, res) => {
        // Sacar el string a buscar
        const searchString = req.params.search;
    
        // Usar expresión regular para hacer la búsqueda insensible a mayúsculas y minúsculas
        const searchRegex = new RegExp(searchString, 'i');
    
        // Buscar en la base de datos
        Article.find({
            $or: [
                { title: { $regex: searchRegex } },
                { content: { $regex: searchRegex } }
            ]
        })
        .sort({ date: 'descending' })
        .exec((err, articles) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error en la petición'
                });
            }
    
            if (!articles || articles.length === 0) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No se encontraron artículos que coincidan con la búsqueda'
                });
            }
    
            return res.status(200).send({
                status: 'success',
                articles
            });
        });
    }
    

};  // end controller

module.exports = controller;