# React-Carousel

This is a simple, no dependency carousel, built on just ReactJS.

````
var ReactDOM = require('react-dom');
var React = require('react');

var Carousel = require('./Carousel');

var choices = [
  'http://www.hercampus.com/sites/default/files/2013/02/27/topic-1350661050.jpg',
  'http://www.hercampus.com/sites/default/files/2013/02/27/topic-1350661050.jpg',
  'http://www.hercampus.com/sites/default/files/2013/02/27/topic-1350661050.jpg'
];

ReactDOM.render(
  <Carousel choices={choices}/>,
  document.getElementById('carousel')
);

````
