

import "../../../../src/style.css"


export default function Cover() {

    var radius = 480;
    var autoRotate = true;
    var rotateSpeed = -60;
    var imgWidth = 100;
    var imgHeight = 150;
    var numImages = 10; // Adjust this to match the number of images you have
    var spacing = 360 / numImages; // Calculate the angle spacing
    setTimeout(init, 1000);
    var odrag = document.getElementById('drag-container');
    var ospin = document.getElementById('spin-container');
    var aImg = ospin.getElementsByTagName('img');
    var aVid = ospin.getElementsByTagName('video');
    var aEle = [...aImg, ...aVid];

    // Size of images
    ospin.style.width = imgWidth + "px";
    ospin.style.height = imgHeight + "px";

    // Size of ground - depend on radius
    var ground = document.getElementById('ground');
    ground.style.width = radius * 3 + "px";
    ground.style.height = radius * 3 + "px";

    function init(delayTime) {
        for (var i = 0; i < aEle.length; i++) {
          var angle = (i - (aEle.length - 1) / 2) * spacing;
          aEle[i].style.transform = "rotateY(" + angle + "deg) translateZ(" + radius + "px)";
      
          // Calculate the duration for which the image should be visible (half of the rotation)
          var rotationDuration = Math.abs(angle / rotateSpeed);
      
          // Set the animation properties for fade out
          aEle[i].style.transition = `transform ${rotationDuration / 2}s ease-in-out, opacity 1s`;
          aEle[i].style.transitionDelay = delayTime || (aEle.length - i) / 4 + "s";
          aEle[i].style.opacity = 0; // Initially set the opacity to 0
      
          // Use setTimeout to gradually fade in the image after a delay
          setTimeout(function (element) {
            element.style.opacity = 1;
      
            // Set the animation properties for fade in
            element.style.transition = `transform ${rotationDuration / 2}s ease-in-out, opacity 1s`;
            element.style.transitionDelay = (delayTime || (aEle.length - i) / 4) + (rotationDuration / 2) + "s";
          }, rotationDuration / 2 * 1000, aEle[i]);
        }
      }
      
      
      

    if (autoRotate) {
        var animationName = (rotateSpeed > 0 ? 'spin' : 'spinRevert');
        ospin.style.animation = `${animationName} ${Math.abs(rotateSpeed)}s infinite linear`;
    }

return (
    <div className="bg-[url(bgplain.jpg)] bg-cover bg-center h-4/6">

        <section className="h-screen text-white flex justify-center">
            <div>
                <div className="mb-96"></div>
                <div id="drag-container">
                    <div id="spin-container">

                        {/* <img src="1.jpg" alt="" />
                        <img src="2.jpg" alt="" />*/}
                        <img src="gallery1.png" alt="" />
                        {/* <img src="gallery2.png" alt="" />
                            <img src="gallery3.png" alt="" />
                            <img src="gallery4.png" alt="" />
                            <img src="gallery5.png" alt="" />
                            <img src="gallery1.png" alt="" />
                            <img src="gallery2.png" alt="" />
                            <img src="gallery3.png" alt="" />
                            <img src="gallery4.png" alt="" />
                            <img src="gallery5.png" alt="" /> */}


                        {/* <video controls autoplay="autoplay" loop>
                            <source src="1.mp4" type="video/mp4" />
                        </video> */}

                        <p>CSSScript</p>
                    </div>
                    <div id="ground"></div>
                </div>
                <div className="mt-96 scale-[0.65]">
                    <img src="logoplain.png" alt="" />
                </div>
            </div>


        </section>

    </div>
)
}