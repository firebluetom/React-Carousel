jest.dontMock('../src/Carousel.jsx');
jest.dontMock('react');
jest.dontMock('react-dom');
jest.useFakeTimers();

describe('Carousel', function () {
  var React = require('react');
  var ReactDOM = require('react-dom');
  var Carousel = require('../src/Carousel.jsx');
  var TestUtils = require('react-addons-test-utils');
  var onSelect = jest.fn();

  describe('Carousel mounts successfully', function () {
    var choices = ['images/image.png', 'images/image2.png'];
    var choice = 'images/image.png';
    var Component = TestUtils.renderIntoDocument(<Carousel choices={choices} choice={choice} onSelect={onSelect} delaySnapToDuration={1} snapToDuration={1} animationEnabled={false}/>);

    it('it always renders a div with a className of carousel', function () {
      var wrapperDiv = TestUtils.scryRenderedDOMComponentsWithTag(Component, 'div');
      expect(wrapperDiv[0].classList.toString()).toContain('carousel');
    });

    it('should focus on the selected card when the carousel is focused on', function () {
      var wrapperDiv = TestUtils.scryRenderedDOMComponentsWithTag(Component, 'div');
      TestUtils.Simulate.focus(wrapperDiv[0]);
      expect(Component.state.activeIndex).toBe(0);
    });

    it('should focus on the selected card when the image is clicked on and index is not 0', function () {
      var wrapperDiv = TestUtils.scryRenderedDOMComponentsWithTag(Component, 'div');
      TestUtils.Simulate.focus(wrapperDiv[0]);
      expect(Component.state.activeIndex).toBe(0);
      var images = TestUtils.scryRenderedDOMComponentsWithClass(Component, 'carousel-selector-option');
      TestUtils.Simulate.click(images[images.length - 1]);
      jest.runAllTimers();
      expect(Component.state.activeIndex).toBe(images.length - 1);
    });

    it('should mark the card as selected when select button is clicked and the carousel to close', function () {
      var selectButton = TestUtils.findRenderedDOMComponentWithClass(Component, 'selector-button');
      TestUtils.Simulate.click(selectButton);
      expect(Component.state.activeIndex).toBe(1);
      var wrapperDiv = TestUtils.scryRenderedDOMComponentsWithTag(Component, 'div');
      expect(wrapperDiv[0].classList.toString()).toContain('closed');
      var active = TestUtils.scryRenderedDOMComponentsWithClass(Component, 'carousel-selector-option active');
      expect(active.length).toBe(1);
      expect(onSelect).toBeCalled();
    });

    it('should open the carousel when clicked', function () {
      var choices = TestUtils.findRenderedDOMComponentWithClass(Component, 'choices');
      TestUtils.Simulate.click(choices);
      jest.runAllTimers();
      var wrapperDiv = TestUtils.scryRenderedDOMComponentsWithTag(Component, 'div');
      expect(wrapperDiv[0].classList.toString()).toContain('open');
    });

    it('should select the previous card when left arrow is pressed', function () {
      var choices = TestUtils.findRenderedDOMComponentWithClass(Component, 'choices');
      TestUtils.Simulate.focus(choices);
      var currentIdx = Component.state.activeIndex;
      TestUtils.Simulate.keyDown(choices, {key: 'Left Arrow', which: 37, keyCode: 37});
      jest.runAllTimers();
      expect(Component.state.activeIndex).not.toBe(currentIdx);
    });

    it('should select the next card when right arrow is pressed', function () {
      var choicesDom = TestUtils.findRenderedDOMComponentWithClass(Component, 'choices');
      TestUtils.Simulate.focus(choicesDom);
      var currentIdx = Component.state.activeIndex;
      TestUtils.Simulate.keyDown(choicesDom, {key: 'Right Arrow', which: 39, keyCode: 39});
      jest.runAllTimers();
      expect(Component.state.activeIndex).not.toBe(currentIdx);
    });

    it('should not change the index if the carousel is closed ', function () {
      var choicesDom = TestUtils.findRenderedDOMComponentWithClass(Component, 'choices');
      var selectButton = TestUtils.findRenderedDOMComponentWithClass(Component, 'selector-button');
      TestUtils.Simulate.click(selectButton);
      var currentIdx = Component.state.activeIndex;
      TestUtils.Simulate.keyDown(choicesDom, {key: 'Right Arrow', which: 39, keyCode: 39});
      jest.runAllTimers();
      TestUtils.Simulate.keyDown(choicesDom, {key: 'Left Arrow', which: 37, keyCode: 37});
      jest.runAllTimers();
      expect(Component.state.activeIndex).toBe(currentIdx);
    });

    it('should open if the carousel is closed and then focused on', function () {
      Component.closeCarousel();
      var wrapperDiv = TestUtils.scryRenderedDOMComponentsWithTag(Component, 'div');
      expect(wrapperDiv[0].classList.toString()).toContain('closed');
      var carousel = TestUtils.findRenderedDOMComponentWithClass(Component, 'carousel');
      TestUtils.Simulate.focus(carousel);
      jest.runAllTimers();
      expect(wrapperDiv[0].classList.toString()).toContain('open');
    });

    it('should open if the carousel is closed and Enter is hit', function () {
      var selectButton = TestUtils.findRenderedDOMComponentWithClass(Component, 'selector-button');
      TestUtils.Simulate.click(selectButton);
      var choicesDom = TestUtils.findRenderedDOMComponentWithClass(Component, 'choices');
      TestUtils.Simulate.keyDown(choicesDom, {key: 'Enter', which: 13, keyCode: 13});
      jest.runAllTimers();
      var wrapperDiv = TestUtils.scryRenderedDOMComponentsWithTag(Component, 'div');
      expect(wrapperDiv[0].classList.toString()).toContain('open');
    });

    it('should calculate scale when the user scrolls the choices container', function () {
      Component = TestUtils.renderIntoDocument(<Carousel choices={choices} choice={choice} onSelect={onSelect} delaySnapToDuration={1} snapToDuration={1} />);
      Component.smoothScrollToItemAtIndex = jest.fn();
      Component.carouselChoices.scrollLeft = 100;
      Component.handleScroll();
      Component.animateScrollPosition(0);
      jest.runAllTimers();
      expect(Component.smoothScrollToItemAtIndex).toBeCalled();
    });

    it('should unmount ', function () {
      ReactDOM.unmountComponentAtNode(ReactDOM.findDOMNode(Component).parentNode);
    });
  });
});
