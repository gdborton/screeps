module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-screeps');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.initConfig({
    screeps: {
      options: {
        accountAlias: 'Hatyr',
        token: process.env.SCREEPS_TOKEN || require('./token.json'),
        branch: 'default',
        ptr: false
      },
      dist: {
        files: [{
          expand: true,
          cwd: 'dist/',
          src: ['**/*.{js,wasm}'],
          flatten: true,
        }]
      }
    },
    watch: {
      scripts: {
        files: 'dist/**/*.js',
        tasks: ['screeps'],
        options: {
          interrupt: true,
        },
      },
    },
  });
}