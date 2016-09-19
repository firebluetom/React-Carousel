var React = require('react');
var style = require('./styles/carousel.scss');

var _onFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || window.oRequestAnimationFrame;
if (!_onFrame) { // fallback for timers when RAF not available
  var lastTime = 0;
  _onFrame = function (callback) {
    var currTime = new Date().getTime();
    var timeToCall = Math.max(0, 16 - (currTime - lastTime));
    var id = window.setTimeout(function () { callback(currTime + timeToCall); }, timeToCall);
    lastTime = currTime + timeToCall;
    return id;
  };
}
// performance not available in phantom

(function(){
  if ("performance" in window == false) {
    window.performance = {};
  }
  Date.now = (Date.now || function () {  // thanks IE8
    return new Date().getTime();
  });
  if ("now" in window.performance == false){
    var nowOffset = Date.now();
    if (performance.timing && performance.timing.navigationStart){
      nowOffset = performance.timing.navigationStart
    }
    window.performance.now = function now(){
      return Date.now() - nowOffset;
    }
  }
})();

var Carousel = React.createClass({

  propTypes: {
    choices: React.PropTypes.array.isRequired,
    choice: React.PropTypes.string,
    onSelect: React.PropTypes.func
  },

  getInitialState: function () {
    var animationEnabled = true;
    if (this.props.animationEnabled === false) {
      animationEnabled = false;
    }
    return {
      activeIndex: 0,
      numCards: this.props.choices.length,
      delayBeforeSnappingToPosition: this.props.delaySnapToDuration || 100,
      durationOfSnapToAnimation: this.props.snapToDuration || 500,
      animationEnabled: animationEnabled,
      percentAwayFromLeftSideOfCarousel: 0.15,
      carouselState: 'open'
    };
  },

  componentDidMount: function () {
    var self = this;
    this.potentialSelectionIndex = 0;
    this.addScrollListenerOnChoicesContainer();
    this.calculateScale(); // run scale calculation and mark the correct item
    if (!document.styleSheets.length) { // in case the styles didn't load yet, re-calculate
      setTimeout(function () {
        self.calculateScale(); // run scale calculation and mark the correct item
      });
    }
  },

  componentWillUnmount: function () {
    this.removeScrollListenerFromChoicesContainer();
  },

  addScrollListenerOnChoicesContainer: function () {
    this.carouselChoices.addEventListener('scroll', this.handleScroll);
  },

  removeScrollListenerFromChoicesContainer: function () {
    this.carouselChoices.removeEventListener('scroll', this.handleScroll);
  },

  calculateScale: function () {
    var largest = 0;
    for (var i = 0; i < this.carouselChoices.children.length; i++) {
      var item = this.carouselChoices.children[ i ];
      var scale = 1 - (Math.abs(this.carouselChoices.scrollLeft - (item.offsetLeft - this.carouselChoices.offsetWidth * this.state.percentAwayFromLeftSideOfCarousel)) / this.carouselChoices.scrollWidth);
      item.style.transform = 'scaleY(' + scale + ')';
      if (scale > largest) {
        largest = scale;
        this.potentialSelectionIndex = i;
        this.markItemActiveAtIndex(this.potentialSelectionIndex);
      }
    }
  },

  handleScroll: function () {
    var self = this;
    if (this.state.animationEnabled === true) {
      _onFrame(this.calculateScale);
    }
    clearTimeout(this.scrollTimeout);
    this.scrollTimeout = setTimeout(function snapTo () {
      self.carouselChoices.children[self.potentialSelectionIndex].focus(); // focus on scrolled item
      self.smoothScrollToItemAtIndex(self.potentialSelectionIndex);
    }, this.state.delayBeforeSnappingToPosition); // snap to the correct position within
  },

  isChildScrollPositionCentered: function (childIdx) {
    var marginOfError = 5; // allow for within 5px
    var childDistanceFromLeftOfContainer = this.carouselChoices.children[childIdx].offsetLeft;
    var containerWidth = this.carouselChoices.offsetWidth;
    var containerScrolledAmount = this.carouselChoices.scrollLeft;
    // allow margin of error due to pixel calculations
    if (Math.abs(containerScrolledAmount - (childDistanceFromLeftOfContainer - (containerWidth * this.state.percentAwayFromLeftSideOfCarousel))) < marginOfError) {
      return true;
    } else {
      return false;
    }
  },

  calculateTargetScrollPosition: function (targetChildIdx) { // given the index of the child calculate the scroll in px that we want to target
    var targetChild = this.carouselChoices.children[targetChildIdx];
    return Math.round(targetChild.offsetLeft - (this.carouselChoices.offsetWidth * this.state.percentAwayFromLeftSideOfCarousel));
  },

  smoothScrollToItemAtIndex: function (itemIndex) {
    if (!this.isChildScrollPositionCentered(itemIndex)) { // animate if not centered
      this.removeScrollListenerFromChoicesContainer();
      clearTimeout(this.scrollTimeout);
      this.animateScrollPosition(this.calculateTargetScrollPosition(itemIndex));
    }
  },

  animateScrollPosition: function (targetPosition) {
    var self = this;
    var scrollCount = 0;
    var oldTimestamp = performance.now();
    var oneHundredPercent = 100;
    var originalScrollLeft = self.carouselChoices.scrollLeft;
    function step (newTimestamp) {
      scrollCount += oneHundredPercent / (self.state.durationOfSnapToAnimation / (newTimestamp - oldTimestamp));
      if (scrollCount >= oneHundredPercent) {
        self.carouselChoices.scrollLeft = targetPosition;
      }
      if (self.carouselChoices.scrollLeft === targetPosition) {
        clearTimeout(self.scrollTimeout);
        self.addScrollListenerOnChoicesContainer();
        return;
      }
      var movement = (targetPosition - originalScrollLeft) * (scrollCount / oneHundredPercent);
      var newScrollLeft = originalScrollLeft + movement;
      self.carouselChoices.scrollLeft = Math.round(newScrollLeft);
      self.calculateScale();
      oldTimestamp = newTimestamp;
      _onFrame(step);
    }
    if (this.state.animationEnabled === true) {
      _onFrame(step);
    } else {
      self.carouselChoices.scrollLeft = targetPosition;
    }
  },

  nextCard: function () {
    if (this.state.activeIndex + 1 < this.state.numCards) {
      var newIndex = this.state.activeIndex + 1;
      this.markItemActiveAtIndex(newIndex);
      this.smoothScrollToItemAtIndex(newIndex);
    }
  },

  previousCard: function () {
    if (this.state.activeIndex > 0) {
      var newIndex = this.state.activeIndex - 1;
      this.markItemActiveAtIndex(newIndex);
      this.smoothScrollToItemAtIndex(newIndex);
    }
  },

  markItemActiveAtIndex: function (idx) {
    var self = this;
    clearTimeout(this.activeItemTimeout);
    this.activeItemTimeout = setTimeout(function () {
      self.setState({
        activeIndex: idx || self.potentialSelectionIndex
      });
    }, 50);
  },

  controlClick: function (idx, e) {
    this.markItemActiveAtIndex(idx);
    this.smoothScrollToItemAtIndex(idx);
  },

  carouselKeyDown: function (e) {
    if (e.which === 13 && this.state.carouselState === 'closed') { // if enter was pressed
      this.openCarousel();
    } else if (this.state.carouselState === 'closed') {
      e.preventDefault();
      return;
    }
    switch (e.which) {
      case 39: // pressing right arrow
        this.nextCard();
        break;
      case 37: // press left arrow
        this.previousCard();
        break;
    }
  },

  onCarouselFocus: function (e) {
    if (e.target.className.indexOf('carousel') > -1) { // prevent from firing on child elements
      if (this.state.carouselState === 'closed') {
        this.openCarousel();
      }
      this.smoothScrollToItemAtIndex(this.state.activeIndex);
    }
  },

  onCarouselClick: function () {
    if (this.state.carouselState === 'closed') {
      this.openCarousel();
      this.addScrollListenerOnChoicesContainer();
    }
  },

  openCarousel: function () {
    var self = this;
    self.setState({
      carouselState: 'open'
    }, function () {
      // callback for set state is to modify the scroll position instantly when carousel opens
      self.carouselChoices.scrollLeft = self.calculateTargetScrollPosition(self.state.activeIndex);
      self.addScrollListenerOnChoicesContainer();
    });
  },

  closeCarousel: function () {
    this.setState({
      carouselState: 'closed'
    });
  },

  selectCard: function (event) {
    event.preventDefault();
    this.closeCarousel();
    this.removeScrollListenerFromChoicesContainer();
    this.carousel.blur();
    if (this.props.onSelect) {
      this.props.onSelect(this.state.activeIndex, event);
    }
  },

  render: function () {
    var self = this;
    var options = [];
    var controls = [];

    this.props.choices.forEach(function (item, idx) {
      var boundItemClick = self.controlClick.bind(self, idx);
      var isActive = '';
      if (self.state.activeIndex === idx) {
        isActive = ' active ';
      }
      options.push(
        <div className={'carousel-selector-option' + isActive} key={'card' + idx} aria-label={'card' + idx} tabIndex="-1" onClick={boundItemClick}>
          <img src={item} />
        </div>
      );
      controls.push(
        <div key={'control' + idx} className={'control-option' + isActive} onClick={boundItemClick}></div>
      );
    });

    return (
      <div className={'carousel ' + this.state.carouselState} tabIndex="0" onFocus={this.onCarouselFocus} onKeyDown={this.carouselKeyDown} onClick={this.onCarouselClick} ref={function (carousel) { self.carousel = carousel; }}>
        <h3>Select Your Card</h3>
        <div className="choices" ref={function (carouselChoices) { self.carouselChoices = carouselChoices; }}>
          {options}
        </div>
        <div className="controls"> {controls} </div>
        <button className="selector-button" onClick={this.selectCard} >Select</button>
      </div>
    );
  }
});

module.exports = Carousel;
