var ReactDOM = require('react-dom');
var React = require('react');

var Carousel = require('./Carousel');

var choices = [
  'http://www.hercampus.com/sites/default/files/2013/02/27/topic-1350661050.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Small-city-symbol.svg/348px-Small-city-symbol.svg.png',
  'http://innovativeprofessionaloffices.com/wp-content/uploads/2014/07/seo-for-small-business.jpg'
];

ReactDOM.render(
  <Carousel choices={choices}/>,
  document.getElementById('carousel')
);