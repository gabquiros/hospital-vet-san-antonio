export default () => {
    const $homeSlider = $('.hero-slider'),
    			$serviceSlider = $('.service-slider');
    $(document).ready(function() {
    	$homeSlider.slick({
    		arrows: false,
    		dots: true,
    		autoplay: true,
    		infinite: true
    	});

    	$serviceSlider.slick({
    		arrows: true,
    		dots: false,
    		infinite: true,
			slidesToShow: 4,
			slidesToScroll: 4,
            responsive: [
                {
                  breakpoint: 767,
                  settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                  }
                }
              ]

    	});
    });
};