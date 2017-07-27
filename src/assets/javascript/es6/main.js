'use strict';

// Import Modules
import sliders from './modules/sliders';
import map from './modules/map';
// Import Vendors
import vendor from './vendors/vendor';

// jQuery DOM Ready
$(() => {
  'use strict';
  sliders(); 
  map();
  // Initialize Vendors
  vendor();

});
