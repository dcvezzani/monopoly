import _ from 'lodash';

module.exports = class Deck {
  constructor(data) {
    this.deck = data;
  }

  shuffle (shuffleCnt=1000) {
    // for 1000 turns
    // switch the values of two random cards
    // for (let i = 0; i < 1000; i++)
    _.range(shuffleCnt).forEach(i => 
    {
      let location1 = Math.floor((Math.random() * this.deck.length));
      let location2 = Math.floor((Math.random() * this.deck.length));
      let tmp = this.deck[location1];

      this.deck[location1] = this.deck[location2];
      this.deck[location2] = tmp;
    })
  }

  deal(cardCnt=1, pileCnt=1, direction='top')
  {
    let piles = [];
    let card = null; 
    let drawPos = null;

    _.range(cardCnt).forEach(card => {
      _.range(pileCnt).forEach(pile => {

        switch (direction) {
          case 'top':
            // remove top card from deck
            drawPos = 0
            break;
          case 'bottom':
            // remove bottom card from deck
            drawPos = this.deck.length-1
            break;
        }

        if (this.deck.length > 0) {
          card =  this.deck[drawPos];
          this.deck.splice(drawPos, 1);

          if (_.isNil(piles[pile])) {
            piles[pile] = []
          }

          // collect drawn cards in piles
          piles[pile].push (card);
        }

      });
    });

    return _.map(piles, (pile) => {return _.compact(pile)})
  }
}

/*
let cardData = [
  {title: 'death comes suddenly', body: 'Lorem eos facere quae fugiat asperiores ea.'}, 
  {title: 'a new hope', body: 'Natus minima adipisci rerum voluptatibus ea.'}, 
  {title: 'empire strikes back', body: 'Iste illo inventore eveniet doloremque.'}, 
  {title: 'return of the jedi', body: 'fugiat asperiores ea Totam dolore facere.'}, 
  {title: 'force awakens', body: 'labore facere doloremque, velit?'}, 
]

let deck = new Deck(cardData)
deck.shuffle();
console.log(["deck:", JSON.parse(JSON.stringify(deck))])
console.log(["deck:deal", deck.deal(), JSON.parse(JSON.stringify(deck))])
console.log(["deck:deal", deck.deal(1, 1, 'bottom'), JSON.parse(JSON.stringify(deck))])
console.log(["deck:deal", deck.deal(2, 2), JSON.parse(JSON.stringify(deck))])
*/

