var ReactDOM = require('react-dom');
var React = require('react');

var Carousel = require('./Carousel');

var choices = ['images/1.jpg'];

ReactDOM.render(
  <Carousel choices={choices}/>,
  document.getElementById('carousel')
);