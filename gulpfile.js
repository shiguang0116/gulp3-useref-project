/**
 * @description: gulp配置文件
 * @author: guang.shi <https://blog.csdn.net/guang_s>
 * @date: 2018-12-13 17:53:40
 */
'use strict'

var gulp = require('gulp')
var babel = require('gulp-babel') // 编译es6
var htmltpl = require('gulp-html-tpl') // 引用html模板
var artTemplate = require('art-template') // 模板渲染
var rename = require('gulp-rename') // 重命名
var clean = require('gulp-clean') // 清空文件夹
var gulpif = require('gulp-if') // 条件判断
var uglify = require('gulp-uglify') // js压缩
var pump = require('pump')
var csso = require('gulp-csso') // css压缩
var less = require('gulp-less') // less编译
var autoprefixer = require('gulp-autoprefixer')	// 自动添加CSS前缀
var htmlmin = require('gulp-htmlmin') // html压缩
var imagemin = require('gulp-imagemin') // 图片压缩
var cache = require('gulp-cache') // 图片缓存（只压缩修改的图片）
var browserSync = require('browser-sync').create() // 用来打开一个浏览器
var watch = require('gulp-watch') // 监听文件（修改、新建、删除）
var runSequence = require('run-sequence') // 按顺序执行task

var useref = require('gulp-useref') // 解析html中的构建块
var filter = require('gulp-filter') // 过滤文件
var revAll = require('gulp-rev-all') // 增加版本号

// 路径
var html_path = 'src/{pages,common,components}/**/*.html'
var html_main_path = 'src/pages/**/*.html'
var html_common_path = 'src/common/**/*.html'
var js_libs_path = 'src/libs/**/*.js'
var js_main_path = 'src/{utils,pages,common,components}/**/*.js'
var css_libs_path = 'src/libs/**/*.css'
var css_main_path = 'src/{styles,pages,common,components}/**/*.{css,less}'
var images_path = ['src/images/**', 'favicon.ico']
var fonts_path = 'src/libs/**/fonts/**'

// 设置环境变量
var env = ''
function set_env(type) {
    env = process.env.NODE_ENV = type || 'dev'
}

// js_libs
gulp.task('js_libs', function() {
    return gulp.src(html_common_path)
        .pipe(useref())
        .pipe(filter(js_libs_path))
        .pipe(gulpif(env === 'build', uglify()))
        .pipe(rename({ dirname: '' }))
        .pipe(gulp.dest('dist/js'))
})
// js_main
gulp.task('js_main', function() {
    return gulp.src(html_common_path)
        .pipe(useref())
        .pipe(filter(js_main_path))
        .pipe(babel()) // 编译es6语法
        .pipe(gulpif(env === 'build', uglify()))
        .pipe(rename({ dirname: '' }))
        .pipe(gulp.dest('dist/js'))
})
// css_libs
gulp.task('css_libs', function() {
    return gulp.src(html_common_path)
        .pipe(useref())
        .pipe(filter(css_libs_path))
        .pipe(gulpif(env === 'build', csso())) // 压缩css
        .pipe(rename({ dirname: 'css' }))
        .pipe(gulp.dest('dist/css'))
})
// css_main
gulp.task('css_main', function() {
    return gulp.src(html_common_path)
        .pipe(useref())
        .pipe(filter(css_main_path))
        .pipe(less()) // 编译less
        .on('error', function(err) { // 解决编译出错，监听被阻断的问题
            console.log('\x1B[31m%s\x1B[0m', '\nLess Error: ' + err.message + '\n')
            this.end()
        })
        .pipe(autoprefixer({
            browsers: ['last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'],
            cascade: false // 是否美化
        }))
        .pipe(gulpif(env === 'build', csso()))
        .pipe(rename({ dirname: '' }))
        .pipe(gulp.dest('dist/css'))
})
// html_common
gulp.task('html_common', function() {
    return gulp.src(html_common_path)
        .pipe(useref())
        // 生成版本号
        .pipe(gulpif(env === 'build', revAll.revision({
            dontRenameFile: ['.html'], // 不给 html 文件添加版本号
            dontUpdateReference: ['.html'] // 不给文件里链接的html加版本号
        })))
        // 打包 html_common
        .pipe(filter(html_common_path))
        .pipe(gulp.dest('dist/common'))
})

// // 解析html中的构建块（js、css打包 | 添加版本号）
// gulp.task('useref', function(watch_type) {
//     var jsLibsFilter = filter(js_libs_path, { restore: true })
//     var jsMainFilter = filter(js_main_path, { restore: true })
//     var cssLibsFilter = filter(css_libs_path, { restore: true })
//     var cssMainFilter = filter(css_main_path, { restore: true })
//     var htmlCommonFilter = filter(html_common_path, { restore: true })

//     return gulp.src('src/common/**/*.html')
//         .pipe(useref()) // 解析html中的构建块

//         // 生成版本号
//         .pipe(gulpif(env === 'build', revAll.revision({
//             dontRenameFile: ['.html'], // 不给 html 文件添加版本号
//             dontUpdateReference: ['.html'] // 不给文件里链接的html加版本号
//         })))

//         // js_libs
//         .pipe(jsLibsFilter) // 过滤指定文件
//         .pipe(gulpif(env === 'build', uglify())) // 压缩js
//         .pipe(rename({ dirname: '' })) // 清空文件夹
//         .pipe(gulp.dest('dist/js')) // 打包
//         .pipe(jsLibsFilter.restore) // 恢复过滤

//         // js_main
//         .pipe(jsMainFilter)
//         .pipe(babel()) // 编译es6语法
//         .pipe(gulpif(env === 'build', uglify()))
//         .pipe(rename({ dirname: '' }))
//         .pipe(gulp.dest('dist/js'))
//         .pipe(jsMainFilter.restore)

//         // css_libs
//         .pipe(cssLibsFilter)
//         .pipe(gulpif(env === 'build', csso())) // 压缩css
//         .pipe(rename({ dirname: 'css' }))
//         .pipe(gulp.dest('dist/css'))
//         .pipe(cssLibsFilter.restore)

//         // css_main
//         .pipe(cssMainFilter)
//         .pipe(less()) // 编译less
//         .on('error', function(err) { // 解决编译出错，监听被阻断的问题
//             console.log('\x1B[31m%s\x1B[0m', '\nLess Error: ' + err.message + '\n')
//             this.end()
//         })
//         .pipe(autoprefixer({
//             browsers: ['last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'],
//             cascade: false // 是否美化
//         }))
//         .pipe(gulpif(env === 'build', csso()))
//         .pipe(rename({ dirname: '' }))
//         .pipe(gulp.dest('dist/css'))
//         .pipe(cssMainFilter.restore)

//         // 打包 html_common
//         .pipe(htmlCommonFilter)
//         .pipe(gulp.dest('dist/common'))
//         .pipe(htmlCommonFilter.restore)
// })

// html模板处理
gulp.task('html', function() {
    var dir = 'dist'
    // var dir = env === 'dev' ? 'src' : 'dist'
    var common_paths = [`${dir}/common`, 'src/components']

    return gulp.src(html_main_path)
        .pipe(htmltpl({
            tag: 'component',
            paths: common_paths,
            engine: function(template, data) {
                return template && artTemplate.compile(template)(data)
            },
            // 传入页面的初始化数据
            data: {
                env: env, // 环境变量
                header: false,
                g2: false
            }
        }))
        .pipe(rename({
            dirname: '' // 清空路径
        }))
        .pipe(gulpif(env === 'build', htmlmin({
            removeComments: true, // 清除HTML注释
            collapseWhitespace: true, // 压缩HTML
            minifyJS: true, // 压缩页面JS
            minifyCSS: true // 压缩页面CSS
        })))
        .pipe(gulp.dest('dist'))
})

/**
 * @description 检查压缩JS时的错误，作为'js_main'的依赖执行。
 *
 * 1、解决js压缩出错的问题
 * 2、解决修改的代码有语法错误时，服务会终止的问题
 */
gulp.task('uglify_check', function(cb) {
    pump([
        gulp.src(js_main_path),
        babel(),
        uglify()
    ], cb)
})

// 打包其他资源
gulp.task('images', function() {
    return gulp.src(images_path)
        .pipe(rename({ dirname: '' }))
        .pipe(gulpif(env === 'dev', cache(imagemin({
            optimizationLevel: 5, // 取值范围：0-7（优化等级），默认：3
            progressive: true, // 无损压缩jpg图片，默认：false
            interlaced: true, // 隔行扫描gif进行渲染，默认：false
            multipass: true // 多次优化svg直到完全优化，默认：false
        }))))
        .pipe(gulp.dest('dist/images'))
})
gulp.task('fonts', function() {
    return gulp.src(fonts_path)
        .pipe(rename({ dirname: '' }))
        .pipe(gulp.dest('dist/fonts'))
})
gulp.task('cache.clear', function() {
    cache.clearAll()
})

// 清空dist文件夹
gulp.task('clean', function() {
    return gulp.src(['dist/*'])
        .pipe(clean())
})
gulp.task('clean_extra', function() {
    return gulp.src(['dist/common'])
        .pipe(clean())
})

// 启本地服务，并打开浏览器
gulp.task('browser', function() {
    browserSync.init({
        server: 'dist' // 访问目录，自动指向该目录下的 index.html 文件
        // proxy: "你的域名或IP"    // 设置代理
    })
})
gulp.task('browser_reload', function() {
    browserSync.reload()
})

// 监听文件变化（'add', 'change', 'unlink'）
gulp.task('watch', function() {
    w('src/**/.{js,css}', '')
    w(html_path, 'html')
    w(images_path, 'images')
    w(fonts_path, 'fonts')

    function w(path, task) {
        watch(path, function() {
            runSequence(task, 'browser_reload') // 打包完成后，再刷新浏览器。监听任务不要带cb参数，否则会报错：回调次数太多
        })
    }
})

// 开发环境
gulp.task('dev', function(cb) {
    set_env('dev')
    runSequence(
        ['clean'],
        ['html_common', 'js_libs', 'js_main', 'css_libs', 'css_main', 'images', 'fonts'], // 不分先后的任务最好并行执行，提高效率
        ['html'],
        ['browser', 'watch'],
        cb)
})

// 生产环境
gulp.task('build', function(cb) {
    set_env('build')
    runSequence(
        ['clean'], // 首先清理文件，否则会把新打包的文件清掉
        ['html_common', 'js_libs', 'js_main', 'css_libs', 'css_main', 'images', 'fonts'], // 不分先后的任务最好并行执行，提高效率
        ['html'],
        ['clean_extra'], // 清空多余的文件
        cb)
})
