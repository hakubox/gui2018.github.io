var CanvasParticle = (i => {
	
	// 根据传入的config初始化画布
	function canvasInit(canvasConfig = {}) {

		var canvas = {
			element: document.querySelector(canvasConfig.el),
			points : [],
			config: {
				el: canvasConfig.el || 'bgCanvas',
				vx: canvasConfig.vx || 4,
				vy:  canvasConfig.vy || 4,
				height: canvasConfig.height || 2,
				width: canvasConfig.width || 2,
				count: canvasConfig.count || 100,
				color: canvasConfig.color || "121, 162, 185",
				stroke: canvasConfig.stroke || "130,255,255",
				dist: canvasConfig.dist || 6000,
				e_dist: canvasConfig.e_dist || 20000,
				max_conn: 10
			}
		};
		canvasSize(canvas.element);
		window.onresize = () => canvasSize(canvas.element);

		if(canvas.element.getContext("2d")) canvas.context = canvas.element.getContext("2d");
		else return null;

		document.body.onmousemove = e => {
			var event = e || window.event;
			canvas.mouse = {
				x: event.clientX,
				y: event.clientY
			}
		};
		document.body.onmouseleave = () => canvas.mouse = undefined;
		let _fn = i => requestAnimationFrame(i => {
			drawPoint(canvas);
			_fn();
		});
		_fn();
	}

	function canvasSize(canvas){
		var width = parseInt(canvas.style.width);
		var height = parseInt(canvas.style.height);
		canvas.width = width || window.innerWeight || document.documentElement.clientWidth || document.body.clientWidth;
		canvas.height = height || window.innerWeight || document.documentElement.clientHeight || document.body.clientHeight;
	}

	// 画点
	function drawPoint(canvas){
		var context = canvas.context,
			point,
			dist;
		context.clearRect(0, 0, canvas.element.width, canvas.element.height);
		context.beginPath();
		context.fillStyle = "rgb("+ canvas.config.color +")";
		for(let i = 0, len = canvas.config.count; i < len; i++) {
			if(canvas.points.length != canvas.config.count){
				// 初始化所有点
				point = {
					x: Math.floor(Math.random() * canvas.element.width),
					y: Math.floor(Math.random() * canvas.element.height),
					vx: canvas.config.vx / 2 - Math.random() * canvas.config.vx,
					vy: canvas.config.vy / 2 - Math.random() * canvas.config.vy
				}
			} else {
				// 处理球的速度和位置，并且做边界处理
				point =	borderPoint(canvas.points[i], canvas);
			}
			context.fillRect(point.x - canvas.config.width / 2, point.y - canvas.config.height / 2, canvas.config.width, canvas.config.height);

			canvas.points[i] = point;
		}
		drawLine(context, canvas, canvas.mouse);
		context.closePath();
	}

	// 边界处理
	function borderPoint(point, canvas) {
		let p = point;
		if(point.x <= 0 || point.x >= canvas.element.width) {
			p.vx = -p.vx;
			p.x += p.vx;
		} else if (point.y <= 0 || point.y >= canvas.element.height) {
			p.vy = -p.vy;
			p.y += p.vy;
		} else {
			p = {
				x: p.x + p.vx,
				y: p.y + p.vy,
				vx: p.vx,
				vy: p.vy
			}
		}
		return p;
	}

	// 画线
	function drawLine(context, canvas, mouse){
		context = context || canvas.context;
		for(let i = 0, len = canvas.config.count; i < len; i++){
			// 初始化最大连接数
			canvas.points[i].max_conn = 0;
			
			for(let j = 0; j < len; j++){
				if(i != j){
					dist = Math.round(canvas.points[i].x - canvas.points[j].x) * Math.round(canvas.points[i].x - canvas.points[j].x) + 
							Math.round(canvas.points[i].y - canvas.points[j].y) * Math.round(canvas.points[i].y - canvas.points[j].y);
					// 两点距离小于吸附距离，而且小于最大连接数，则画线
					if(dist <= canvas.config.dist && canvas.points[i].max_conn <canvas.config.max_conn){
						canvas.points[i].max_conn++;
						// 距离越远，线条越细，而且越透明
						context.lineWidth = 0.5 - dist / canvas.config.dist;
						context.strokeStyle = "rgba("+ canvas.config.stroke + ","+ (1 - dist / canvas.config.dist) +")"
						context.beginPath();
						context.moveTo(canvas.points[i].x, canvas.points[i].y);
						context.lineTo(canvas.points[j].x, canvas.points[j].y);
						context.stroke();
					}
				}
			}
			// 如果鼠标进入画布
			// point to mouse
			if(mouse){
				dist = Math.round(canvas.points[i].x - mouse.x) * Math.round(canvas.points[i].x - mouse.x) + 
					   Math.round(canvas.points[i].y - mouse.y) * Math.round(canvas.points[i].y - mouse.y);
				// 遇到鼠标吸附距离时加速，直接改变point的x，y值达到加速效果
				// if(dist > canvas.config.dist && dist <= canvas.config.e_dist){
				// 	canvas.points[i].x = canvas.points[i].x + (mouse.x - canvas.points[i].x) / 20;
				// 	canvas.points[i].y = canvas.points[i].y + (mouse.y - canvas.points[i].y) / 20;
				// }
				if(dist <= canvas.config.e_dist){
					context.lineWidth = 1;
					context.strokeStyle = "rgba("+ canvas.config.stroke + "," + (1 - dist / canvas.config.e_dist) + ")";
					context.beginPath();
					context.moveTo(canvas.points[i].x, canvas.points[i].y);
					context.lineTo(mouse.x, mouse.y);
					context.stroke();
				}
			}
		}
	}
	return canvasInit;
})();
