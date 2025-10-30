import{d as i,r as n,e as v,c as g,a,l as x,m as u,u as m,p as h,q as l,o as R,_ as p}from"./index-B5-EKOCl.js";const b={class:"container"},_={class:"blog"},y={class:"box"},S=i({__name:"Canvas_01",setup(C){const s=n(),r=n();function c(){if(!s.value)return;const t=s.value.getContext("2d");t.fillStyle="rgba(200,200,200,1)",t.fillRect(0,0,s.value.width,s.value.height),t.fillStyle="rgba(100,100,100,1)",t.transform(1,0,0,1,50,50),t.fillRect(0,0,50,50),t.fillStyle="rgba(100,100,100,0.6)",t.transform(1,0,0,1,50,50),t.fillRect(0,0,50,50),t.save(),t.fillStyle="rgba(100,100,100,0.3)",t.transform(1,0,0,1,50,50),t.fillRect(0,0,50,50),t.restore()}function o(){if(!r.value)return;const t=r.value.getContext("2d");t.fillStyle="rgba(200,200,200,1)",t.fillRect(0,0,r.value.width,r.value.height),t.fillStyle="rgba(100,100,100,1)",t.setTransform(1,0,0,1,50,50),t.fillRect(0,0,50,50),t.fillStyle="rgba(255,255,2,0.6)",t.setTransform(1,0,0,1,50,50),t.fillRect(0,0,70,70),t.fillStyle="rgba(100,100,100,0.3)",t.setTransform(1,0,0,1,100,100),t.fillRect(0,0,50,50)}v(()=>{c(),o()});let d=` /** transform **/
// 三个矩形
ctx.fillStyle = 'rgba(200,200,200,1)';
ctx.fillRect(0, 0, canvasRef1.value.width, canvasRef1.value.height);
ctx.fillStyle = 'rgba(100,100,100,1)';
ctx.transform(1, 0, 0, 1, 50, 50);
ctx.fillRect(0, 0, 50, 50);

ctx.fillStyle = 'rgba(100,100,100,0.6)';
ctx.transform(1, 0, 0, 1, 50, 50);
ctx.fillRect(0, 0, 50, 50);

ctx.save();
ctx.fillStyle = 'rgba(100,100,100,0.3)';
ctx.transform(1, 0, 0, 1, 50, 50);
ctx.fillRect(0, 0, 50, 50);
ctx.restore();

/** setTransform **/
ctx.fillStyle = 'rgba(200,200,200,1)';
ctx.fillRect(0, 0, canvasRef2.value.width, canvasRef2.value.height);
ctx.fillStyle = 'rgba(100,100,100,1)';
ctx.setTransform(1, 0, 0, 1, 50, 50);
ctx.fillRect(0, 0, 50, 50);
ctx.fillStyle = 'rgba(255,255,2,0.6)';

ctx.setTransform(1, 0, 0, 1, 50, 50);
ctx.fillRect(0, 0, 70, 70);
ctx.fillStyle = 'rgba(100,100,100,0.3)';

ctx.setTransform(1, 0, 0, 1, 100, 100);
ctx.fillRect(0, 0, 50, 50);
`;return(t,e)=>{const f=h("highlightjs");return R(),g("div",b,[a("div",_,[e[0]||(e[0]=x('<h2 data-v-92d06564>浅谈canvas的相对变换、绝对变换</h2><p data-v-92d06564> 我们知道：canvas有位移、旋转、缩放画布的功能。同时，也提供了<code data-v-92d06564>transform()</code>与<code data-v-92d06564>setTransform()</code>两个变换方法，用矩阵的形式表示所有的变换。那这两个方法有什么区别呢？<a href="https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/transform" target="_blank" data-v-92d06564>MDN</a>上对二者的解释是： </p><ul data-v-92d06564><li data-v-92d06564> Canvas 2D API 的<code data-v-92d06564>CanvasRenderingContext2D.transform()</code> 方法用于将由该方法的参数所描述的矩阵与<strong data-v-92d06564>当前的变换</strong>相乘。你可以缩放、旋转、平移和倾斜上下文 </li><li data-v-92d06564><code data-v-92d06564>CanvasRenderingContext2D.setTransform()</code> 方法用于使用单位矩阵<strong data-v-92d06564>重新设置（覆盖）当前的</strong>变换并调用变换，此变换由方法的变量进行描述。这使你能够对上下文进行缩放、旋转、平移（移动）和倾斜操作。 </li></ul><p data-v-92d06564> 从官方的解释上可以看到<code data-v-92d06564>transform</code>是基于当前的变换而进行的，<code data-v-92d06564>setTransform</code>则是重置了当前的变换。文字有些抽象，我们可以尝试运行几个例子： </p>',4)),u(f,{language:"JavaScript",autodetect:!1,code:m(d)},null,8,["code"]),a("div",y,[a("canvas",{width:"300",height:"300",ref_key:"canvasRef1",ref:s,class:"canvas"},null,512),a("canvas",{width:"300",height:"300",ref_key:"canvasRef2",ref:r,class:"canvas"},null,512)]),e[1]||(e[1]=a("p",null,[l(" 我们可以看到，"),a("code",null,"transform"),l("每次变换，都是参考当前的坐标系，或者说矩阵进行的。第一个正方形向右下偏移50px绘制，此时相对的是左上角的canvas原点。第二个进行相同的变换，但此时的基点，是变换后的基点，也就是第一个也就是官方说的当前变换的基础上进行的变换。 ")],-1)),e[2]||(e[2]=a("p",null,[l(" 而"),a("code",null,"setTransform"),l("绘制出的三个正方形，三次的变换基点都是左上角的canvas原点。 总的来说"),a("code",null,"transform"),l("是相对当前变换的变换，也就是相对变换，首次执行的变换，可以理解为当前变换的矩阵为三阶单位矩阵。"),a("code",null,"setTransform"),l("则是绝对变换，永远都相对于画布的原点进行变换。 ")],-1))])])}}}),w=p(S,[["__scopeId","data-v-92d06564"]]);export{w as default};
