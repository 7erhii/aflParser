// Pages
import aflPageParser from "./pages/aflAU/afl.js";
import newsAuSportParser from "./pages/newsAU/newsSport.js";

// AFL
aflPageParser("*/10 * * * * *", (newNews) => {
  console.log("AFL новости:", newNews);
});

// SportAU
newsAuSportParser("*/10 * * * * *", (newNews) => {
  console.log("SportAU новости:", newNews);
});
