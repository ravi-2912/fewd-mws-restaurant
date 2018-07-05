
module.exports = function(grunt) {

    grunt.initConfig({
        responsive_images: {
            task_1: {
                options: {
                    /*engine: 'im',*/
                    sizes: [{
                        name: "1x",
                        width: 300,
                        quality: 90
                    }, {
                        name: "2x",
                        width: 600,
                        quality: 90
                    }, {
                        name: "hd",
                        width: 800,
                        quality: 90
                    }]
                },

                files: [{
                    expand: true,
                    src: ['*.{gif,jpg,png}'],
                    cwd: 'img_src',
                    dest: 'img'
                }]
            },
        },

        /* Clear out the images directory if it exists */
        clean: {
            dev: {
                src: ['img/']
            },
        },

        /* Generate the images directory if it is missing */
        mkdir: {
            dev: {
                options: {
                    create: ['img']
                },
            },
        },
    });
  
    grunt.loadNpmTasks('grunt-responsive-images');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-mkdir');
    grunt.registerTask('default', ['clean', 'mkdir', 'responsive_images']);

};

/*
npm install grunt-mkdir --save-dev
npm install grunt-contrib-clean --save-dev
npm install grunt-contrib-copy --save-dev
npm install grunt-responsive-images --save-dev*/