function isValidCouponCode(couponCode) {
  // // example coupon code: TTN2TTTTT001

  // // Kupon kodunun ilk 4 ve son 1 karakterinin "TTN" ve "1" olduğundan emin ol
  // const firstThreeCharacters = couponCode.substring(0, 3);
  // // firstThreeCharacters must be "TTN"
  // if (firstThreeCharacters !== "TTN") return false;

  // const codeArray = couponCode.split("");

  // const array = []

  // let lastIndexOfNumber = 0;

  // codeArray.forEach((char, index) => {

  //   if (index > lastIndexOfNumber) return;

  //   const isNumber = !isNaN(char);

  //   const parts = []

  //   if (isNumber) {
  //     parts.push(char)
  //     const splitted = codeArray.slice(index + 1, codeArray.length)
  //     for (let index = 0; index < splitted.length; index++) {
  //       const element = splitted[index];
  //       if (!isNaN(element)) parts.push(element)
  //       break;
  //     }
  //   }

  //   parts.push(char)
  //   const splitted = codeArray.slice(index + 1, codeArray.length)
  //   for (let index = 0; index < splitted.length; index++) {
  //     const element = splitted[index];
  //     if (isNaN(element)) parts.push(element)
  //     break;
  //   }


  //   array.push(parts.join(""))

  // });

  // console.log(array);
  return true;
}



isValidCouponCode("TTN2TTTTT001"); // true