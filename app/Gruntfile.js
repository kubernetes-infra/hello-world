module.exports = (grunt) => {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    watch: {
      styles: {
        files: 'static/less/**/*.less',
        tasks: ['less'],
        options: {
          interrupt: true,
        },
      },
    },

    copy: {
      dist: {
        files: [{
          expand: true,
          cwd: 'node_modules/semantic-ui-less/themes/default',
          src: '**',
          dest: 'static/themes/default/',
        }],
      },
    },

    less: {
      dist: {
        options: {
          paths: ['node_modules/semantic-ui-less'],
        },
        files: {
          'static/css/app.css': 'static/less/app.less',
        },
      },
    },

    concat: {
      options: {
        separator: ';',
      },
      js: {
        src: [
          'node_modules/jquery/dist/jquery.min.js',
          'node_modules/semantic-ui-less/definitions/**/*.js',
        ],
        dest: 'static/js/bundle.js',
      },
    },

  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['less', 'copy', 'concat']);
};
