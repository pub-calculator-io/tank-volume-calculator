function calculate(){
  // 1. init & validate
  const shape = input.get('shape').raw();
  const unit = input.get('units').raw();
  const unitCoeff = {
    'Meters': '1',
    'Miles': '1609.35',
    'Yards': '0.9144',
    'Feet': '0.3048',
    'Inches': '0.0254',
    'Kilometers': '1e3',
    'Centimeters': '1e-2',
    'Millimeters': '1e-3',
    'Micrometers': '1e-6',
    'Nanometers': '1e-9',
    'Angstroms': '1e-10',
  }[unit];
  const volCoeffs = {
    'm³': '1',
    'gal': '0.00378541',
    'imp-gal': '0.00454609',
    'L': '1e-3',
    'ft³': '0.028316846592'
  };

  // 2. calculate
  const get = id => math.bignumber(input.get(id).positive().raw());
  const getOpt = id => input.get(id).optional().positive().raw();
  const f = math.bignumber(getOpt('filled_depth') || 0);
  const checkFill = (value) => {
    if(calc('f>value',{f,value})){ 
      input.error('filled_depth', 'It seems your tank is over filled.');
    }
  }

  let tankVol = '0', fillVol = '0'; // m³
  let horizontalCylinderVols = (l,d,f) => {
    let tankVol = calc(`pi*d^2/4*l`,{d,l});

    const θ = calc(`2*acos(${calc('f<1/2*d',{f,d}) ?`1`:`-1`}*(d/2-f)/(d/2))`,{d,f});
    const segVol = calc(`(1/2)*d^2/4*(θ-sin(θ))*l`,{θ,d,l});
    let fillVol;
    if(calc(`f<1/2*d`,{d,f})){
      fillVol = segVol;
    } else {
      fillVol = calc(`tankVol-segVol`,{tankVol,segVol});
    }
    return {tankVol, fillVol};
  };
  switch(shape){
    case 'Horizontal Cylinder':{ 
      const l = get('horizontal_cylinder_length');
      const d = get('horizontal_cylinder_diameter');
      checkFill(d);
      if(!input.valid()) return;

      ({tankVol, fillVol} = horizontalCylinderVols(l,d,f));
    }break;
    case 'Vertical Cylinder':{
      const h = get('vertical_cylinder_height');
      const d = get('vertical_cylinder_diameter');
      checkFill(h);
      if(!input.valid()) return;

      tankVol = calc(`pi*d^2/4*h`,{d,h});
      fillVol = calc(`pi*d^2/4*f`,{d,f});
    }break;
    case 'Rectangle':{ 
      const h = get('rectangle_height');
      const l = get('rectangle_length');
      const w = get('rectangle_width');
      checkFill(h);
      if(!input.valid()) return;

      tankVol = calc(`l*w*h`,{l,w,h});
      fillVol = calc(`l*w*f`,{l,w,f});
    }break;
    case 'Horizontal Oval':{ 
      const h = get('horizontal_oval_height');
      const l = get('horizontal_oval_length');
      const w = get('horizontal_oval_width');
      checkFill(h);
      if(w <= h) {
        input.error('horizontal_oval_width', 'Width must be greater than height.');
      }
      if(!input.valid()) return;

      tankVol = calc('(pi*h^2/4+2*h/2*(w-h))*l', {l,w,h});

      let {fillVol:hcFillVol} = horizontalCylinderVols(l,h,f);
      fillVol = calc('hcFillVol+l*(w-h)*f', {hcFillVol,l,h,w,f});
    }break;
    case 'Vertical Oval':{ 
      const h = get('vertical_oval_height');
      const l = get('vertical_oval_length');
      const w = get('vertical_oval_width');
      checkFill(h);
      if(h <= w) {
        input.error('vertical_oval_height', 'Height must be greater than width.');
      }
      if(!input.valid()) return;
      
      tankVol = calc('(pi*w^2/4+2*w/2*(h-w))*l', {l,w,h});

      if(calc(`f<1/2*w`,{w,f})){
        let {fillVol:hcFillVol} = horizontalCylinderVols(l,w,f);
        fillVol = hcFillVol;
      }
      if(calc(`1/2*w<=f<(1/2*w+(h-w))`,{h,w,f})){
        fillVol = calc('1/2*pi*w^2/4*l+w*l*(f-w/2)',{w,l,f});
      }
      if(calc('f>=(1/2*w+(h-w))',{h,w,f})){
        let {fillVol:hcFillVol} = horizontalCylinderVols(l,w,calc('h-f',{h,f}));
        fillVol = calc('tankVol-hcFillVol',{tankVol,hcFillVol});
      }
    }break;
    case 'Horizontal Capsule':{
      const d = get('horizontal_capsule_diameter');
      const l = get('horizontal_capsule_length');
      checkFill(d);
      if(!input.valid()) return;

      tankVol = calc('pi*d^2/4*(4/3*d/2+l)',{l,d});

      let {fillVol:hcFillVol} = horizontalCylinderVols(l,d,f);
      if(calc(`f<1/2*d`,{d,f})){
        fillVol = calc('1/3*pi*f^2*(3/2*d-f)+hcFillVol',{d,f,hcFillVol});
      } else {
        fillVol = calc('4/3*pi*d^3/8-1/3*pi*(d-f)^2*(3/2*d-(d-f))+hcFillVol',{d,f,hcFillVol});
      }
    }break;
    case 'Vertical Capsule':{ 
      const d = get('vertical_capsule_diameter');
      const l = get('vertical_capsule_length');
      checkFill(calc('d+l',{d,l}));
      if(!input.valid()) return;

      tankVol = calc('pi*d^2/4*(4/3*d/2+l)',{l,d});

      if(calc(`f<1/2*d`,{d,f})){
        fillVol = calc('1/3*pi*f^2*(3/2*d-f)',{d,f});
      }
      if(calc(`1/2*d<=f<(1/2*d+l)`,{d,l,f})){
        fillVol = calc('4/3*pi*(d/2)^3/2+pi*d^2/4*(f-d/2)',{d,f});
      }
      if(calc('f>=(1/2*d+l)',{d,l,f})){
        fillVol = calc('4/3*pi*(d/2)^3+pi*d^2/4*l-1/3*pi*(d+l-f)^2*(3/2*d-(d+l-f))',{d,l,f});
      }
    }break;
    case 'Horizontal 2:1 Elliptical':{ 
      const d = get('horizontal_elliptical_diameter');
      const l = get('horizontal_elliptical_length');
      checkFill(d);
      if(!input.valid()) return;

      tankVol = calc('pi*d^2/4*l+pi*d^3/12',{d,l});

      let {fillVol:hcFillVol} = horizontalCylinderVols(l,d,f);
      if(calc(`f<1/2*d`,{d,f})){
        fillVol = calc('pi*d^3/12*(3*(f/d)^2-2*(f/d)^3)+hcFillVol',{f,d,hcFillVol});
      } else {
        fillVol = calc('pi*d^3/12-pi*d^3/12*(3*((d-f)/d)^2-2*((d-f)/d)^3)+hcFillVol',{f,d,hcFillVol});
      }
    }break;
    case 'Horizontal Dish Ends':{ // torispherical
      const d = get('horizontal_dish_ends_diameter');
      const l = get('horizontal_dish_ends_length');
      checkFill(d);
      if(!input.valid()) return;

      // https://myengineeringtools.com/Data_Diagrams/Volume_Horizontal_Cylinder_Tank.html
      // results differs from https://www.calculatorsoup.com/calculators/construction/tank.php
      tankVol = calc('pi*d^2/4*l+2*0.1*d^3',{d,l});
      let {fillVol:hcFillVol} = horizontalCylinderVols(l,d,f);
      if(calc(`f<1/2*d`,{d,f})){
        fillVol = calc('2*0.2*f^2*(3*d/2-f)+hcFillVol', {f,d,hcFillVol});
      } else {
        fillVol = calc('2*0.1*d^3-2*0.2*(d-f)^2*(3*d/2-(d-f))+hcFillVol', {f,d,hcFillVol});
      }
    }break;
    case 'Horizontal Ellipse':{ 
      const l = get('horizontal_ellipse_length');
      const h = get('horizontal_ellipse_height');
      const w = get('horizontal_ellipse_width');
      checkFill(h);
      if(!input.valid()) return;

      tankVol = calc('pi*l*h*w/4',{l,h,w});

      if(calc(`f<1/2*h`,{h,f})){
        fillVol = calc('l*(w/2*h/2*acos(1-2*f/h)-w/2*(h/2-f)*sqrt(1-(1-2*f/h)^2))',{f,h,w,l});
      } else {
        fillVol = calc('pi*l*h*w/4-l*(w/2*h/2*acos(1-2*(h-f)/h)-w/2*(h/2-(h-f))*sqrt(1-(1-2*(h-f)/h)^2))',{f,h,w,l});
      }
    }break;
  }
  tankVol = calc(`tankVol*unitCoeff^3`,{tankVol,unitCoeff});
  fillVol = calc(`fillVol*unitCoeff^3`,{fillVol,unitCoeff});
  const getTotal = unit => calc(`tankVol/volCoeff`,{tankVol,volCoeff:volCoeffs[unit]});
  const getFilled = unit => calc(`fillVol/volCoeff`,{fillVol,volCoeff:volCoeffs[unit]});

  // 3. output
  _('result_percent_fill').innerHTML = calc(`fillVol/tankVol*100`,{fillVol,tankVol});
  _('result_m3_total').innerHTML = getTotal('m³');
  _('result_gal_total').innerHTML = getTotal('gal');
  _('result_imp-gal_total').innerHTML = getTotal('imp-gal');
  _('result_ft3_total').innerHTML = getTotal('ft³');
  _('result_l_total').innerHTML = getTotal('L');
  _('result_m3_filled').innerHTML = getFilled('m³');
  _('result_gal_filled').innerHTML = getFilled('gal');
  _('result_imp-gal_filled').innerHTML = getFilled('imp-gal');
  _('result_ft3_filled').innerHTML = getFilled('ft³');
  _('result_l_filled').innerHTML = getFilled('L');
}

window.switchUnits = el => {
  const unit = el.value;
  const units = {
    'Meters': 'm', 
    'Miles': 'mi', 
    'Yards': 'yd', 
    'Feet': 'ft', 
    'Inches': 'in', 
    'Kilometers': 'km', 
    'Centimeters': 'cm', 
    'Millimeters': 'mm', 
    'Micrometers': 'µm', 
    'Nanometers': 'nm', 
    'Angstroms': 'Å'
  };
  $$('.input-field__hint').forEach(el=>{
    el.innerHTML=units[unit];
  });
};

window.addEventListener('load', () => math.config({number:'BigNumber', precision: 6}));
