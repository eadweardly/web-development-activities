var cars = [
  {
    id: 0,
    brand: "Ford",
    model: "Mustang Fastback",
    year: 1967,
    engine: "4.7L 289 cu in V8",
    category: "American",
    image: "images/ford-mustang-fastback-1967.jpg",
    description: "Long hood, short deck, and a roofline that made every parking lot look slower.",
    memory: "She always picked the radio station. Now it stays on static.",
    price: "$55,000 - $95,000",
    power: "225 hp (4-barrel version)",
    transmission: "3-speed auto or 4-speed manual",
    topSpeed: "About 115 mph",
    note: "One of the most recognizable fastback shapes ever built",
  },
  {
    id: 1,
    brand: "Chevrolet",
    model: "Bel Air",
    year: 1957,
    engine: "4.6L 283 cu in V8",
    category: "American",
    image: "images/chevrolet-bel-air-1957.jpg",
    description: "Chrome, tailfins and a wide front seat made for two. The face of the golden age.",
    memory: "The bench seat was built for two. It has been a long time since it felt that way.",
    price: "$45,000 - $110,000",
    power: "220 hp (up to 283 hp with fuel injection)",
    transmission: "3-speed manual or Powerglide auto",
    topSpeed: "About 110 mph",
    note: "Part of the famous 1955 to 1957 Tri-Five Chevys",
  },
  {
    id: 2,
    brand: "Jaguar",
    model: "E-Type",
    year: 1961,
    engine: "3.8L XK inline-six",
    category: "British",
    image: "images/jaguar-e-type-1961.jpg",
    description: "Long, low and impossibly graceful. Enzo Ferrari reportedly called it the most beautiful car ever made.",
    memory: "Too beautiful to drive alone, and yet here we are.",
    price: "$100,000 - $250,000",
    power: "265 hp",
    transmission: "4-speed manual",
    topSpeed: "About 150 mph",
    note: "Launched in 1961 at the Geneva Motor Show",
  },
  {
    id: 3,
    brand: "Chevrolet",
    model: "Corvette Sting Ray",
    year: 1963,
    engine: "5.4L 327 cu in V8",
    category: "American",
    image: "images/corvette-sting-ray-1963.jpg",
    description: "Hidden headlights, sharp fender lines and a split rear window that was only made for one year.",
    memory: "The split window only lasted a year. Some things are not meant to stay.",
    price: "$100,000 - $300,000",
    power: "250 to 360 hp depending on engine option",
    transmission: "3-speed or 4-speed manual, Powerglide auto",
    topSpeed: "About 140 mph",
    note: "The 1963 split-window coupe is the most sought-after version",
  },
  {
    id: 4,
    brand: "Porsche",
    model: "911 Carrera RS",
    year: 1973,
    engine: "2.7L air-cooled flat-six",
    category: "German",
    image: "images/porsche-911-carrera-rs-1973.jpg",
    description: "A road-going race car with the famous ducktail spoiler. Light, loud and honest.",
    memory: "It was fast enough to outrun almost anything. Almost.",
    price: "$900,000 - $1,600,000",
    power: "210 hp",
    transmission: "5-speed manual",
    topSpeed: "About 150 mph",
    note: "Roughly 1,590 built, made to meet racing homologation rules",
  },
  {
    id: 5,
    brand: "Mercedes-Benz",
    model: "300SL Gullwing",
    year: 1954,
    engine: "3.0L fuel-injected inline-six",
    category: "German",
    image: "images/mercedes-300sl-gullwing-1954.jpg",
    description: "The doors lift like wings. The first production car with fuel injection, and a legend from day one.",
    memory: "The doors open upward, as if the whole car is still hoping someone will climb in.",
    price: "$1,200,000 - $2,000,000",
    power: "215 hp",
    transmission: "4-speed manual",
    topSpeed: "Up to about 155 mph",
    note: "About 1,400 coupes built between 1954 and 1957",
  },
];

var placeholderImage =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500">' +
      '<rect width="100%" height="100%" fill="#1e1e1e"/>' +
      '<text x="50%" y="48%" fill="#b89b5e" font-family="Georgia, serif" font-size="34" text-anchor="middle" letter-spacing="8">EMPTY PASSENGER</text>' +
      '<text x="50%" y="58%" fill="#8d8573" font-family="Georgia, serif" font-size="20" text-anchor="middle" font-style="italic">photo coming soon</text>' +
      "</svg>"
  );

var elParent = document.getElementById("parent");

function displayCars(list) {
  elParent.innerHTML = "";

  for (var i = 0; i < list.length; i++) {
    var car = list[i];

    elParent.innerHTML += `<div class="col-12 mb-4">
      <div class="card car-card">
        <div class="row g-0 car-wide">
          <div class="col-lg-7 car-photo">
            <img src="${car.image}" alt="${car.year} ${car.brand} ${car.model}" onerror="this.onerror=null; this.src=placeholderImage;" />
          </div>
          <div class="col-lg-5 car-info">
            <div class="car-year">${car.year} &middot; ${car.category}</div>
            <h5 class="card-title mt-1">${car.brand} ${car.model}</h5>
            <div class="car-engine mb-3">${car.engine}</div>
            <p class="car-desc mb-2">${car.description}</p>
            <p class="car-memory mb-3">&ldquo;${car.memory}&rdquo;</p>
            <div class="car-specs mb-3">${car.power} &middot; ${car.transmission} &middot; ${car.topSpeed}</div>
            <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
              <div class="car-price">Est. ${car.price}</div>
              <button class="btn btn-gold" onclick="showDetails(${car.id})">View Details</button>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  }

}

function showDetails(carId) {
  var car = null;
  for (var i = 0; i < cars.length; i++) {
    if (cars[i].id == carId) {
      car = cars[i];
    }
  }

  document.getElementById("modalYear").innerHTML = car.year + " &middot; " + car.category;
  document.getElementById("modalTitle").innerHTML = car.brand + " " + car.model;

  var elImage = document.getElementById("modalImage");
  elImage.onerror = function () {
    elImage.onerror = null;
    elImage.src = placeholderImage;
  };
  elImage.src = car.image;
  elImage.alt = car.year + " " + car.brand + " " + car.model;

  document.getElementById("modalSpecs").innerHTML = `
    <tr><td>Brand</td><td>${car.brand}</td></tr>
    <tr><td>Model</td><td>${car.model}</td></tr>
    <tr><td>Year</td><td>${car.year}</td></tr>
    <tr><td>Engine</td><td>${car.engine}</td></tr>
    <tr><td>Power</td><td>${car.power}</td></tr>
    <tr><td>Gearbox</td><td>${car.transmission}</td></tr>
    <tr><td>Top speed</td><td>${car.topSpeed}</td></tr>
    <tr><td>Good to know</td><td>${car.note}</td></tr>
    <tr><td>Est. price</td><td>${car.price}</td></tr>`;

  document.getElementById("modalDescription").innerHTML = car.description;
  document.getElementById("modalMemory").innerHTML = "&ldquo;" + car.memory + "&rdquo;";

  var modal = new bootstrap.Modal(document.getElementById("detailsModal"));
  modal.show();
}

displayCars(cars);

var elNav = document.getElementById("mainNav");
var elHero = document.getElementById("top");

function updateNav() {
  var heroBottom = elHero.getBoundingClientRect().bottom;
  if (heroBottom <= 80) {
    elNav.classList.add("nav-away");
  } else {
    elNav.classList.remove("nav-away");
  }
}

window.addEventListener("scroll", updateNav);
updateNav();
    
