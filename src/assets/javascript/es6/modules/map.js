export default () => {

  const $map = $('.map'),
        $mapOverlay = $('.map-overlay');

  $mapOverlay.on('click', () => {
    $map.addClass('active');
  }); 

  $map.on('mouseleave', () => {
    if($map.hasClass('active')) {
        $map.removeClass('active');
    }
  });

};