export const manifest = {
	appDir: "_app",
	appPath: "_app",
	assets: new Set([".DS_Store","coloris.min.css","coloris.min.js","favicon.png","style-dark.json"]),
	mimeTypes: {".css":"text/css",".js":"application/javascript",".png":"image/png",".json":"application/json"},
	_: {
		entry: {"file":"_app/immutable/start-5cbae3c4.js","imports":["_app/immutable/start-5cbae3c4.js","_app/immutable/chunks/index-e0a99da6.js","_app/immutable/chunks/singletons-1f742220.js","_app/immutable/chunks/preload-helper-41c905a7.js"],"stylesheets":[],"fonts":[]},
		nodes: [
			() => import('./nodes/0.js'),
			() => import('./nodes/1.js'),
			() => import('./nodes/2.js')
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0], errors: [1], leaf: 2 },
				endpoint: null
			}
		],
		matchers: async () => {
			
			return {  };
		}
	}
};
