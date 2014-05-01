'use strict';

var releaseType = process.env.RELEASE_TYPE || 'prerelease';

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>;' +
      ' Licensed <%= pkg.license %> */\n',
    clean: {
      files: ['dist']
    },
    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true
      },
      dist: {
        src: 'lib/**/*.js',
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        src: '<%= concat.dist.dest %>',
        dest: 'dist/<%= pkg.name %>.min.js'
      }
    },
    qunit: {
      files: 'test/**/*.html'
    },
    jshint: {
      gruntfile: {
        options: {
          node: true
        },
        src: 'Gruntfile.js'
      },
      src: {
        options: {
          jshintrc: '.jshintrc'
        },
        src: ['lib/**/*.js']
      },
      test: {
        options: {
          jshintrc: '.jshintrc'
        },
        src: ['test/**/*.js']
      }
    },
    copy: {
      version: {
        files: [
          { expand: true, cwd: 'dist', src: ['*'], dest: 'dist/<%= pkg.version %>/' }
        ]
      }
    },
    compress: {
      package: {
        options: {
          archive: '<%= pkg.name %>.tgz',
          mode: 'tgz'
        },
        cwd: 'dist',
        expand: true,
        src: ['**']
      }
    },
    release: {
      options: {
        npm: false
      }
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      src: {
        files: '<%= jshint.src.src %>',
        tasks: ['jshint:src', 'qunit']
      },
      test: {
        files: '<%= jshint.test.src %>',
        tasks: ['jshint:test', 'qunit']
      }
    }
  });

  require('load-grunt-tasks')(grunt);

  grunt.registerTask('default',
                     ['clean',
                      'jshint',
                      'qunit',
                      'concat',
                      'uglify']);
  grunt.registerTask('package', ['default', 'copy:version', 'compress:package']);
  grunt.registerTask('version', 'This should only be called by Team City!', ['release:' + releaseType ]);
};
