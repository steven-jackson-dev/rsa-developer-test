const state = {
  config: {
    cardsRequired: 5,
  },
  validation: {
    inputValidation: true,
    cardValidation: true,
    errorMessage: "",
  },
  formData: {
    inputValue: "",
    inputValueArray: [],
  },
  cardData: {
    suitesArr: [],
    cardValueArr: [],
    isSameSuite: false,
    isSequential: false,
    totalCardValue: 0,
    RoyalFlushTotalCardValue: 14 * 5 - 10,
    bestPokerHand: "",
    ranking: null,
    highCard: "",
  },
};

const handleFormSubmit = () => {
  const form = document.querySelector("form");
  form.preventDefault;
  state.formData.inputValue = form.querySelector(".card-input").value;

  // Validate form input
  if (!validateFormInput()) return showErrorMessage();

  // Card Validation
  if (!validateCards()) return showErrorMessage();

  // Card data setup
  assignValuesToRoyalCards();
  isSameSuite();
  isSequential();

  // Find Best Poker Hand
  findBestPokerHand();
  DisplayBestPokerHand();
  // Clear error message
  document.querySelector(".error").innerHTML = "";
};

/************************
Display Best Poker Hand
************************/
const DisplayBestPokerHand = () => {
  const { ranking } = state.cardData;
  switch (ranking) {
    case 1:
      showBestPokerHand(`Rank ${ranking} - Royal Flush`);
      break;
    case 2:
      showBestPokerHand(`Rank ${ranking} - Straight Flush`);
      break;
    case 3:
      showBestPokerHand(`Rank ${ranking} - Four of a Kind`);
      break;
    case 4:
      showBestPokerHand(`Rank ${ranking} - Full House`);
      break;
    case 5:
      showBestPokerHand(`Rank ${ranking} - Flush`);
      break;
    case 6:
      showBestPokerHand(`Rank ${ranking} - Straight`);
      break;
    case 7:
      showBestPokerHand(`Rank ${ranking} - Three of a Kind`);
      break;
    case 8:
      showBestPokerHand(`Rank ${ranking} - Two Pair`);
      break;
    case 9:
      showBestPokerHand(`Rank ${ranking} - Pair`);
      break;
    case 10:
      showBestPokerHand(
        `Rank ${ranking} - High Card (${state.cardData.highCard})`
      );
      break;
    default:
      showBestPokerHand("ERROR: Cannot Determine best Poker Hand");
      break;
  }
};
/************************
!Display Best Poker Hand
************************/

/************************
Find Best Poker Hand
************************/
const findBestPokerHand = () => {
  // prettier-ignore
  const { isSameSuite, isSequential, RoyalFlushTotalCardValue, totalCardValue, cardValueArr } = state.cardData;
  const uniqueCardValues = new Set(cardValueArr);
  const numberCount = Object.values(countOccurrences(cardValueArr));

  // Reset Card data ranking
  state.cardData.ranking = null;

  // Checks for Royal Flush, Straight Flush and Flush
  if (isSameSuite) {
    // prettier-ignore
    state.cardData.ranking = isSequential
    ? RoyalFlushTotalCardValue === totalCardValue
    ? 1: 2: 5;
  }

  // If ranking is rank 2 or higher. Skip the rest
  if (state.cardData.ranking <= 2 && state.cardData.ranking) return;

  // Determine Four of a Kind or Full house
  if (uniqueCardValues.size === 2) {
    // prettier-ignore
    state.cardData.ranking =
      sortArrayDesc(numberCount)[0] === 4 ? 3
        : sortArrayDesc(numberCount)[0] === 3 &&
          sortArrayDesc(numberCount)[1] === 2
        ? 4 : null;
  }

  // If ranking is rank 4 or higher. Skip the rest
  if (state.cardData.ranking <= 4 && state.cardData.ranking) return;

  // Straight
  state.cardData.ranking = isSequential ? 6 : state.cardData.ranking;

  // Determine Three of a Kind or Two Pair
  if (uniqueCardValues.size === 3) {
    // prettier-ignore
    state.cardData.ranking =
      sortArrayDesc(numberCount)[0] === 3 ? 7
        : sortArrayDesc(numberCount)[0] === 2 &&
          sortArrayDesc(numberCount)[1] === 2
        ? 8 : null;
  }

  // Pair
  // prettier-ignore
  state.cardData.ranking =uniqueCardValues.size === 4 ? 9 : state.cardData.ranking;

  // Determine High Card
  if (!state.cardData.ranking) {
    setHighCard();
    state.cardData.ranking = 10;
  }
};
/************************
!Find Best Poker Hand
************************/

/************************
Card Helper Functions
************************/
const setHighCard = () => {
  const { cardValueArr } = state.cardData;
  const highCard = sortArrayDesc(cardValueArr)[0];
  switch (highCard) {
    case 11:
      state.cardData.highCard = "Jack";
      break;
    case 12:
      state.cardData.highCard = "Queen";
      break;
    case 13:
      state.cardData.highCard = "King";
      break;
    case 14:
      state.cardData.highCard = "Ace";
      break;
    default:
      state.cardData.highCard = highCard;
      break;
  }
};

const isSameSuite = () => {
  const isSameSuite = new Set(state.cardData.suitesArr);
  state.cardData.isSameSuite = isSameSuite.size > 1 ? false : true;
};

const isSequential = () => {
  // prettier-ignore
  const {cardData: { cardValueArr }, config: { cardsRequired }} = state;

  const sequenceTotal = sortArrayDesc(cardValueArr)[0] * cardsRequired - 10;
  const totalCardValue = sumOfCardValues(cardValueArr);

  state.cardData.totalCardValue = totalCardValue;
  state.cardData.isSequential = sequenceTotal === totalCardValue ? true : false;
};

// Assign numberical values to Royal cards and update state
const assignValuesToRoyalCards = () => {
  const { cardValueArr } = state.cardData;
  const updateCardValues = cardValueArr.map((cardValue) => {
    switch (cardValue) {
      case "j":
        return 11;
      case "q":
        return 12;
      case "k":
        return 13;
      case "a":
        return 14;
      default:
        return +cardValue;
    }
  });

  state.cardData.cardValueArr = updateCardValues;
};

/************************
!Card Helper Functions
************************/

/************************
Card Validation
************************/
const validateCards = () => {
  // Regex pattern to determine if the card is valid
  const pattern = /([2-9]|10|A?|J?|Q?|K?)+([SHDC?])/gim;
  const cardArr = state.formData.inputValueArray;

  // Reset state
  state.cardData.cardValueArr = [];
  state.cardData.suitesArr = [];

  // For loop used to break out on failed regex validation
  // Could solve this with Regex. Just don't have the knowledge
  for (let i = 0; i < cardArr.length; i++) {
    if (maxCharacter(cardArr[i])) {
      state.validation.errorMessage = `Invalid card: ${cardArr[i]} - Contains duplicate characters`;
      return false;
    }

    if (!cardArr[i].match(pattern)) {
      state.validation.errorMessage = `Invalid card: ${cardArr[i]} - Please enter a valid card and resubmit.`;
      return false;
    }

    // Push matched groups to state
    const match = pattern.exec(cardArr[i]);
    state.cardData.cardValueArr.push(match[1].toLowerCase());
    state.cardData.suitesArr.push(match[2].toLowerCase());
  }

  return true;
};
/************************
!Card Validation
************************/

/************************
Input Validation
************************/
const validateFormInput = () => {
  const { inputValue } = state.formData;
  // Check if input is blank incase user removes required attribute from input
  if (!inputValue) {
    state.validation.errorMessage = "Input cannot be blank";
    return false;
  }

  // Validate if 5 inputs entered are in CSV format
  if (!validateFormInputAsCsvFormat(inputValue)) {
    state.validation.errorMessage =
      "Format is incorrect. It should be a comma separated value and contain 5 cards. Eg. AS, 10C, 10H, 3D, 3S";
    return false;
  }

  return true;
};

const validateFormInputAsCsvFormat = (inputValue) => {
  const inputValueArray = inputValue.split(",");
  // Check if the split array equals the cards required for Poker(5)
  if (inputValueArray.length === state.config.cardsRequired) {
    state.formData.inputValueArray = inputValueArray;
    return true;
  }
  return false;
};

/************************
!Input Validation
************************/

/************************
Helpers
************************/

// Frontend Display
const showErrorMessage = () => {
  document.querySelector(".error").innerHTML = state.validation.errorMessage;
  return false;
};

const showBestPokerHand = (text) => {
  // prettier-ignore
  document.querySelector(".best-poker-hand").innerHTML = `Best Poker Hand: <br><span>${text}</span>`;
  return false;
};
// !Frontend Display

const sortArrayDesc = (arr) => arr.sort((a, b) => b - a);
const sumOfCardValues = (arr) => arr.reduce((total, amount) => total + amount);
const countOccurrences = (arr) =>
  arr.reduce((prev, curr) => ((prev[curr] = ++prev[curr] || 1), prev), {});

/* 
Algorithm I wrote for fun on my Script-kiddie.co.za site
https://script-kiddie.co.za/app/beta/theory/algorithms 
Usage: Given a string of characters, return the character that appears the most often.
   */
const maxCharacter = (str) => {
  if (typeof str !== "string") return "maxCharacter() only accepts strings";
  const mapCharacters = new Map();

  // Removed spaces from string
  str = str.replace(" ", "").toLowerCase();
  const stringArray = str.split("");

  // Search through array and add values to map
  stringArray.map((e) => {
    mapCharacters.has(e)
      ? mapCharacters.set(e, mapCharacters.get(e) + 1)
      : mapCharacters.set(e, 1);
  });

  // Sort Map by values
  const sortMapByValues = [...mapCharacters.entries()].sort(
    (a, b) => b[1] - a[1]
  );

  return sortMapByValues[0][1] > 1 ? true : false;
};

/************************
!Helpers
************************/

/************************
EXTRA UI INTERACTIONS 
************************/

const addCardSetTest = (cardSet) => {
  document.querySelector(".card-input").value = cardSet;
};

const randomizeCards = () => {
  const rank = [...Array(11).keys(), "J", "Q", "K", "A"];
  const suite = ["D", "S", "C", "H"];
  rank.shift();
  rank.shift();
  let randCardStr = "";

  for (let i = 0; i < state.config.cardsRequired; i++) {
    const randRank = rank[(Math.random() * rank.length) | 0];
    const randSuite = suite[(Math.random() * suite.length) | 0];
    randCardStr += `${randRank}${randSuite},`;
  }

  document.querySelector(".card-input").value = randCardStr.slice(0, -1);
};

/************************
!EXTRA UI INTERACTIONS 
************************/
