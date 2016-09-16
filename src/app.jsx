var ReactDOM = require('react-dom');
var React = require('react');

var Carousel = require('./Carousel');

var choices = [
  'https://i.kinja-img.com/gawker-media/image/upload/ct0qwl2ybxh1db1tymi1.jpg',
  'https://i.kinja-img.com/gawker-media/image/upload/xpflvzatualdizw6oznl.jpg',
  'https://i.kinja-img.com/gawker-media/image/upload/yalsuyhmda9vxmwjt5cg.jpg'
];

ReactDOM.render(
  <Carousel choices={choices}/>,
  document.getElementById('carousel')
);