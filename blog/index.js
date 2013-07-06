"use strict";

var data = require('./data');

var perPage = 2;

function getData(req, res, next){

	data.get(function(err, posts){
		if (err) return next(err);
		res.locals._posts = posts;
		next();
	});

}

module.exports = function(app){

	var index = function(req, res, next){
		var page = req.params.page ? parseInt(req.params.page, 10) : 1;
		var tag = req.params.tag;
		var posts = res.locals._posts.posts;
		var tags = res.locals._posts.tags;

		// posts with this tag do not exist
		if (tag && !tags[tag]) return next();

		var postsInTag = tag ? tags[tag] : posts;
		var pages = Math.ceil(postsInTag.length / perPage);

		// page with posts does not exit
		if (page < 1 || page > pages) return next();

		var count = page == pages ? (postsInTag.length - (pages - 1) * perPage) : perPage;
		var postsOnPage = new Array(count);
		for (var i = 0; i < count; i++){
			var post = postsInTag[i + (page - 1) * perPage];
			postsOnPage[i] = tag ? posts[post] : post;
		}

		res.render('blog/index', {
			title: "MooTools Blog",
			posts: postsOnPage,
			nextPage: page < pages && page + 1,
			previousPage: page > 1 && page - 1,
			tag: tag,
			page: 'blog'
		});

	};

	app.get('/blog', getData, index);
	app.get('/blog/page/:page', getData, index);
	app.get('/blog/category/:tag', getData, index);
	app.get('/blog/category/:tag/page/:page', getData, index);

	app.get('/blog/:year/:month/:day/:title', getData, function(req, res, next){
		var url = req.params.year + '/' + req.params.month + '/' +
			req.params.day + '/' + req.params.title;
		var posts = res.locals._posts.posts;
		var urls  = res.locals._posts.urls;

		var postIndex = urls[url];
		var post = postIndex != null && posts[postIndex];
		if (!post) return next();

		res.render('blog/post', {
			title: "MooTools Blog: " + post.title,
			post: post,
			content: post.content,
			page: 'blog'
		});

	});

};
