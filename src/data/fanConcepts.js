// Unofficial, fan-inspired food ideas. Seller names are fictional demo names.
// Each concept has its own locally stored image and a reference to the source work.
export const fanConcepts = [
  // Meals: twelve ideas, with eight additional preparations.
  { slug: 'ichiraku-ramen', category: 'Meals', title: 'Ichiraku Ramen', reference: 'Naruto', businessName: 'Hidden Bowl Kitchen', description: 'Straight from the Hidden Leaf. No ninja license required.', price: 2490, variations: [
    ['Ichiraku Miso Special', 'A richer miso broth for the shinobi who skipped lunch.']
  ] },
  { slug: 'krabby-patty', category: 'Meals', title: 'Krabby Patty', reference: 'SpongeBob SquarePants', businessName: 'Bikini Bottom Bites', description: 'The secret formula is still classified.', price: 2190, variations: [
    ['Double Deluxe Krabby Patty', 'Twice the patty. The secret formula remains under lock and key.']
  ] },
  { slug: 'howls-breakfast', category: 'Meals', title: "Howl's Moving Breakfast", reference: "Howl's Moving Castle", businessName: 'Moving Hearth', description: 'Cooked with a little magic and questionable fire safety.', price: 2690, variations: [
    ["Calcifer's Extra Crispy Breakfast", 'Extra crisp bacon and eggs. Please keep the fire demon supervised.']
  ] },
  { slug: 'luffy-meat', category: 'Meals', title: "Luffy's Meat on the Bone", reference: 'One Piece', businessName: 'Grand Line Grill', description: 'Recommended serving size: one future Pirate King.', price: 4490, variations: [
    ["Captain's Roasted Meat Feast", 'A generous second helping for anyone sailing past dinner.']
  ] },
  { slug: 'mr-pings-noodle-soup', category: 'Meals', title: "Mr. Ping's Secret Noodle Soup", reference: 'Kung Fu Panda', businessName: 'Peaceful Valley Noodles', description: 'The secret ingredient is probably another bowl.', price: 2390, variations: [
    ["Dragon Warrior's Noodle Bowl", 'More noodles, more broth, and absolutely no secret ingredient.']
  ] },
  { slug: 'remys-ratatouille', category: 'Meals', title: "Remy's Ratatouille", reference: 'Ratatouille', businessName: 'Little Chef Table', description: 'A tiny chef would insist you taste every layer.', price: 2890, variations: [
    ["Remy's Garden Ratatouille", 'A colorful vegetable encore with a little extra thyme.']
  ] },
  { slug: 'garfields-lasagna', category: 'Meals', title: "Garfield's Lasagna", reference: 'Garfield', businessName: 'Monday Escape Kitchen', description: 'Mondays are temporary. Lasagna is forever.', price: 2990, variations: [
    ["Garfield's Extra-Cheesy Lasagna", 'A second layer of cheese for getting through a Monday.']
  ] },
  { slug: 'jakes-sandwich', category: 'Meals', title: "Jake's Perfect Sandwich", reference: 'Adventure Time', businessName: 'Ooo Sandwich Club', description: 'Stacked high enough to make a stretchy dog proud.', price: 2590, variations: [
    ["Jake's Everything Sandwich", 'Even more layers. You may need both hands and a plan.']
  ] },
  { slug: 'ponyos-ham-ramen', category: 'Meals', title: "Ponyo's Ham Ramen", reference: 'Ponyo', businessName: 'Seaside Noodle House', description: 'Warm noodles, ham, and the kind of comfort worth surfacing for.', price: 2290 },
  { slug: 'chaliapin-steak-don', category: 'Meals', title: 'Chaliapin Steak Don', reference: 'Food Wars!', businessName: 'Moonlit Rice Bar', description: 'Steak and sweet onions with a dramatic first bite.', price: 3890 },
  { slug: 'ninja-turtle-pizza', category: 'Meals', title: 'Ninja Turtle Pizza', reference: 'Teenage Mutant Ninja Turtles', businessName: 'Sewer Slice Club', description: 'Extra cheese. Cowabunga is optional.', price: 2790 },
  { slug: 'beef-wellington', category: 'Meals', title: "Chef's Beef Wellington", reference: 'Gordon Ramsay culinary reference', businessName: 'Golden Crust Kitchen', description: 'Golden pastry outside, a little dinner theater inside.', price: 4990 },

  // Bakery: eight ideas, twelve additional preparations.
  { slug: 'homers-pink-donut', category: 'Bakery', title: "Homer's Pink Donut", reference: 'The Simpsons', businessName: 'Springfield Sprinkle', description: 'Mmm... discounted donuts. D’oh, one more.', price: 990, variations: [
    ["Homer's Double Sprinkle Donut", 'More sprinkles than a sensible breakfast really needs.'],
    ["Homer's Strawberry-Glazed Donut", 'Pink frosting with a little extra strawberry temptation.']
  ] },
  { slug: 'kronks-spinach-puffs', category: 'Bakery', title: "Kronk's Spinach Puffs", reference: "The Emperor's New Groove", businessName: 'Palace Oven', description: 'Pull the lever. The one that leads to puff pastry.', price: 1590, variations: [
    ["Kronk's Golden Spinach Puffs", 'Flaky, golden, and worthy of an elaborate kitchen song.'],
    ["Kronk's Cheese & Spinach Puffs", 'A little cheese joins the spinach. Wrong lever, right snack.']
  ] },
  { slug: 'kikis-bread', category: 'Bakery', title: "Kiki's Fresh Bakery Bread", reference: "Kiki's Delivery Service", businessName: 'Broom & Crust', description: 'A fresh loaf, delivered without a broomstick.', price: 1490, variations: [
    ["Kiki's Rustic Sourdough", 'A slow-rise loaf for a quick trip across town.'],
    ["Kiki's Morning Bread Basket", 'A little assortment from the oven before the deliveries begin.']
  ] },
  { slug: 'chocolate-cornet', category: 'Bakery', title: 'Chocolate Cornet', reference: 'Lucky Star', businessName: 'Starry Oven', description: 'Start at the thin end or the thick end. We will not judge.', price: 1290, variations: [
    ['Double Chocolate Cornet', 'Chocolate inside and out. The eating strategy remains your call.'],
    ['Hazelnut Chocolate Cornet', 'A hazelnut twist on the eternal first-bite debate.']
  ] },
  { slug: 'skyrim-sweetroll', category: 'Bakery', title: 'Skyrim Sweetroll', reference: 'The Elder Scrolls V: Skyrim', businessName: 'Whiterun Bakehouse', description: 'Someone stole your sweetroll? We found another one.', price: 1390, variations: [
    ['Honey-Glazed Skyrim Sweetroll', 'Guard the glossy icing. Sweetroll theft is still a problem.']
  ] },
  { slug: 'jakes-bacon-pancakes', category: 'Bakery', title: "Jake's Bacon Pancakes", reference: 'Adventure Time', businessName: 'Ooo Breakfast Club', description: 'Bacon pancakes, makin’ bacon pancakes.', price: 1890, variations: [
    ["Jake's Maple Bacon Pancakes", 'The familiar tune, now with a generous pour of maple syrup.']
  ] },
  { slug: 'laputa-egg-toast', category: 'Bakery', title: 'Laputa Egg Toast', reference: 'Castle in the Sky', businessName: 'Skyward Toast', description: 'A fried egg on toast, with a view worth sharing.', price: 1490, variations: [
    ['Laputa Buttered Egg Toast', 'Thick toast, a bright egg, and a little more butter for the journey.']
  ] },
  { slug: 'tree-trunks-apple-pie', category: 'Bakery', title: "Tree Trunks' Apple Pie", reference: 'Adventure Time', businessName: 'Little Orchard Oven', description: 'A warm slice that could start an entire adventure.', price: 1690, variations: [
    ["Tree Trunks' Cinnamon Apple Pie", 'More cinnamon for anyone taking the scenic route home.']
  ] },

  // Desserts.
  { slug: 'ls-strawberry-shortcake', category: 'Desserts', title: "L's Strawberry Shortcake", reference: 'Death Note', businessName: 'Quiet Case Patisserie', description: 'Best enjoyed while thinking very, very hard.', price: 1990, variations: [
    ["L's Extra Strawberry Shortcake", 'A few more berries might help solve the case.'],
    ["L's Creamy Shortcake Slice", 'A soft, cream-filled clue for your afternoon break.']
  ] },
  { slug: 'doraemons-dorayaki', category: 'Desserts', title: "Doraemon's Dorayaki", reference: 'Doraemon', businessName: 'Pocket Treats', description: 'No future gadget required. Just two pancakes and sweet filling.', price: 1490, variations: [
    ["Doraemon's Red Bean Dorayaki", 'The classic sweet red bean filling, straight from the pocket.'],
    ["Doraemon's Mini Dorayaki Pair", 'Two small pancakes for a very big afternoon.']
  ] },
  { slug: 'gojos-kikufuku', category: 'Desserts', title: "Gojo's Kikufuku", reference: 'Jujutsu Kaisen', businessName: 'Sweet Limit Atelier', description: 'A soft mochi break with limitless appeal.', price: 1890, variations: [
    ["Gojo's Cream-Filled Mochi", 'Soft outside, creamy inside, gone in a flash.'],
    ["Gojo's Sweet Mochi Trio", 'Three little treats. Limitless confidence not included.']
  ] },
  { slug: 'portal-cake', category: 'Desserts', title: 'The Cake Is a Lie', reference: 'Portal', businessName: 'Aperture Bakes', description: "We promise it's real this time. Probably.", price: 2290, variations: [
    ['Portal Cherry Chocolate Cake', 'A cherry on top should make the test subject feel better.'],
    ['Still-Not-a-Lie Chocolate Slice', 'A rich slice that exists outside the test chamber. Probably.']
  ] },
  { slug: 'kikis-chocolate-cake', category: 'Desserts', title: "Kiki's Chocolate Cake", reference: "Kiki's Delivery Service", businessName: 'Broom & Cocoa', description: 'Homemade chocolate comfort for a delivery well done.', price: 2190, variations: [
    ["Kiki's Fudge Cake Slice", 'An extra fudgy thank-you after a long flight.']
  ] },
  { slug: 'poke-puffs', category: 'Desserts', title: 'Poké Puffs', reference: 'Pokémon', businessName: 'Pocket Puff Studio', description: 'Little colorful treats. Catching them is the easy part.', price: 1790, variations: [
    ['Berry Poké Puffs', 'A berry-filled set for the sweetest teammate.']
  ] },
  { slug: 'the-grey-stuff', category: 'Desserts', title: 'The Grey Stuff', reference: 'Beauty and the Beast', businessName: 'Enchanted Table', description: "Try the grey stuff. It's unexpectedly delicious.", price: 1990, variations: [
    ['The Grey Stuff Chocolate Cup', 'A little more cocoa for an enchanted dinner finish.']
  ] },
  { slug: 'pinkie-pies-cupcakes', category: 'Desserts', title: "Pinkie Pie's Cupcakes", reference: 'My Little Pony', businessName: 'Party Cloud Cakes', description: 'Party-level frosting, even on an ordinary Tuesday.', price: 1590, variations: [
    ["Pinkie Pie's Sprinkle Cupcakes", 'A little shower of sprinkles for an improvised party.']
  ] },

  // Drinks. All are fictional, non-alcoholic demo drinks.
  { slug: 'senku-cola', category: 'Drinks', title: 'Senku Cola', reference: 'Dr. Stone', businessName: 'Stone Age Sips', description: 'Science made it fizzy. We made it cold.', price: 990, variations: [
    ['Senku Citrus Cola', 'A bright citrus experiment with plenty of ice.'],
    ['Senku Extra-Fizzy Cola', 'Ten billion percent more bubbles. Give or take.']
  ] },
  { slug: 'nuka-cola', category: 'Drinks', title: 'Nuka-Cola', reference: 'Fallout', businessName: 'Vault Soda Counter', description: 'A retro cola for a perfectly ordinary afternoon.', price: 1190, variations: [
    ['Nuka-Cola Cherry', 'A cherry twist on the wasteland-inspired classic.'],
    ['Nuka-Cola Ice Cold', 'The bottle has been chilling in the vault all day.']
  ] },
  { slug: 'kelp-shake', category: 'Drinks', title: 'Kelp Shake', reference: 'SpongeBob SquarePants', businessName: 'Undersea Smoothies', description: 'A bright green smoothie from somewhere under the sea.', price: 1490, variations: [
    ['Kelp Shake Lime', 'A sharper lime splash for an underwater lunch.'],
    ['Kelp Shake Mint', 'Cool mint meets the most memorable green drink in town.']
  ] },
  { slug: 'ponyos-honey-milk', category: 'Drinks', title: "Ponyo's Honey Milk", reference: 'Ponyo', businessName: 'Seaside Warmth', description: 'Warm milk and honey for stormy seaside evenings.', price: 1090, variations: [
    ["Ponyo's Cinnamon Honey Milk", 'The seaside favorite with a little cinnamon warmth.'],
    ["Ponyo's Vanilla Honey Milk", 'A gentle vanilla version for an even cozier cup.']
  ] },
  { slug: 'cactus-juice', category: 'Drinks', title: 'Cactus Juice', reference: 'Avatar: The Last Airbender', businessName: 'Desert Oasis Bar', description: "It'll quench ya. Nothing's quenchier.", price: 1390, variations: [
    ['Cactus Juice Lime Cooler', 'A citrusy, non-alcoholic oasis for a long day in the desert.']
  ] },
  { slug: 'slurm', category: 'Drinks', title: 'Slurm', reference: 'Futurama', businessName: 'Tomorrow Soda Lab', description: 'A suspiciously catchy green soda. No cosmic claims.', price: 1290, variations: [
    ['Slurm Lime Fizz', 'A bubbly lime edition from the future of snack breaks.']
  ] },
  { slug: 'cafe-leblanc-coffee', category: 'Drinks', title: 'Café Leblanc Coffee', reference: 'Persona 5', businessName: 'Midnight Coffee Room', description: 'A quiet black coffee before the next calling card.', price: 1490, variations: [
    ['Café Leblanc House Brew', 'A slightly deeper roast for a long evening at the counter.']
  ] },
  { slug: 'butterbeer', category: 'Drinks', title: 'Butterbeer', reference: 'Harry Potter', businessName: 'Buttercup Brew House', description: 'A frothy butterscotch-inspired drink. No alcohol, no spells.', price: 1690, variations: [
    ['Chilled Butterbeer Float', 'A cold, creamy version for an exceptionally long train ride.']
  ] },

  // Produce. The fantasy food is an edible-looking concept, not a real power-up.
  { slug: 'sashas-half-potato', category: 'Produce', title: "Sasha's Half Potato", reference: 'Attack on Titan', businessName: 'Cadet Garden', description: 'Half a potato. A full commitment.', price: 990, originalPrice: 1980, variations: [
    ["Sasha's Buttered Half Potato", 'Still half a potato. Now with a little butter.'],
    ["Sasha's Seasoned Half Potato", 'A few herbs make a heroic half feel like dinner.']
  ] },
  { slug: 'my-cabbages', category: 'Produce', title: 'MY CABBAGES!!!', reference: 'Avatar: The Last Airbender', businessName: 'Cabbage Cart Co.', description: "Please don't destroy my cabbage cart again.", price: 1190, variations: [
    ['The Surviving Cabbage', 'One cabbage made it through the market day. Treat it kindly.'],
    ['Cabbage Cart Harvest Pair', 'Two fresh heads, carefully guarded from passing heroes.']
  ] },
  { slug: 'popeyes-spinach', category: 'Produce', title: "Popeye's Spinach", reference: 'Popeye', businessName: 'Harbor Greens', description: 'Fresh spinach. Extraordinary strength sold separately.', price: 1090, variations: [
    ["Popeye's Baby Spinach", 'Tender leaves for lunch. Cartoon muscles remain fictional.'],
    ["Popeye's Spinach Bundle", 'A generous bunch of greens for a very ordinary supper.']
  ] },
  { slug: 'golden-apple', category: 'Produce', title: 'Golden Apple', reference: 'Minecraft', businessName: 'Block Orchard', description: '+4 nostalgia. Actual magical effects not included.', price: 1490, variations: [
    ['Golden Apple Orchard Pair', 'Two yellow apples. No crafting table required.'],
    ['Golden Apple Picnic Pick', 'A bright snack for the next blocky adventure.']
  ] },
  { slug: 'devil-fruit', category: 'Produce', title: 'Devil Fruit', reference: 'One Piece', businessName: 'Grand Line Fruits', description: 'A swirly-looking fruit idea. No special abilities promised.', price: 1890, variations: [
    ['Devil Fruit Tropical Cut', 'A colorful dragon fruit snack with no mysterious side effects.']
  ] },
  { slug: 'totoros-corn', category: 'Produce', title: "Totoro's Corn", reference: 'My Neighbor Totoro', businessName: 'Forest Field Farm', description: 'Sweet golden corn for a little countryside picnic.', price: 990, variations: [
    ["Totoro's Corn Pair", 'Two cobs for sharing after the bus stop.']
  ] },
  { slug: 'stardrop', category: 'Produce', title: 'Stardrop', reference: 'Stardew Valley', businessName: 'Valley Fruit Stand', description: 'A starry fruit idea. Energy boosts are only in the game.', price: 1790, variations: [
    ['Stardrop Fruit Slice', 'A little star-shaped fruit for the farmer on a break.']
  ] },
  { slug: 'enchanted-red-apple', category: 'Produce', title: 'Enchanted Red Apple', reference: 'Snow White', businessName: 'Storybook Orchard', description: 'A glossy red apple with a fairy-tale mood. Entirely ordinary fruit.', price: 1190, variations: [
    ['Storybook Red Apple Pair', 'Two crisp apples. We recommend eating them awake.']
  ] },

  // Groceries.
  { slug: 'senzu-beans', category: 'Groceries', title: 'Senzu Beans', reference: 'Dragon Ball', businessName: 'Capsule Pantry', description: 'Just tasty green beans. Instant recovery is fictional.', price: 1390, variations: [
    ['Senzu Bean Snack Pack', 'A small pouch of beans for a very long training day.'],
    ['Senzu Bean Picnic Jar', 'A little more crunch, with no power level attached.']
  ] },
  { slug: 'scooby-snacks', category: 'Groceries', title: 'Scooby Snacks', reference: 'Scooby-Doo', businessName: 'Mystery Pantry', description: 'Cookie-shaped courage for the next mystery.', price: 1490, variations: [
    ['Scooby Snacks Cinnamon Cookies', 'A cinnamon clue you can eat while the others investigate.'],
    ['Scooby Snacks Crunchy Box', 'A bigger box for the whole mystery-solving crew.']
  ] },
  { slug: 'brocks-jelly-donuts', category: 'Groceries', title: "Brock's Jelly Donuts", reference: 'Pokémon', businessName: 'Travel Bento Club', description: 'These jelly-filled donuts look suspiciously like rice balls.', price: 1690, variations: [
    ["Brock's Onigiri Pair", 'Two rice balls, still masquerading as jelly donuts.'],
    ["Brock's Lunchbox Rice Balls", 'A portable snack for the next big journey.']
  ] },
  { slug: 'hakus-onigiri', category: 'Groceries', title: "Haku's Onigiri", reference: 'Spirited Away', businessName: 'Bathhouse Bento', description: 'A handmade rice ball for finding your courage.', price: 1590, variations: [
    ["Haku's Sesame Onigiri", 'Sesame rice and a quiet moment between adventures.'],
    ["Haku's Onigiri Pair", 'Two comforting rice balls for the journey home.']
  ] },
  { slug: 'minecraft-starter-food-chest', category: 'Groceries', title: 'Minecraft Starter Food Chest', reference: 'Minecraft', businessName: 'Crafted Pantry', description: 'Bread, fruit, and the sensible start to a new world.', price: 3990, variations: [
    ['Minecraft Explorer Food Chest', 'A bigger bundle for anyone wandering beyond spawn.']
  ] },
  { slug: 'bachelor-chow', category: 'Groceries', title: 'Bachelor Chow', reference: 'Futurama', businessName: 'Tomorrow Pantry', description: 'Now with flavor. Finally, the future delivers.', price: 2190, variations: [
    ['Bachelor Chow Breakfast Bowl', 'A future-proof cereal bowl for a very present-day morning.']
  ] },
  { slug: 'hyrule-cooking-bundle', category: 'Groceries', title: 'Hyrule Cooking Bundle', reference: 'The Legend of Zelda', businessName: 'Hyrule Market Basket', description: 'Mushrooms and herbs for a meal, not a magical elixir.', price: 4290, variations: [
    ['Hyrule Forest Cooking Bundle', 'More mushrooms for your next real-world dinner.']
  ] },
  { slug: 'totoros-picnic-bento', category: 'Groceries', title: "Totoro's Picnic Bento", reference: 'My Neighbor Totoro', businessName: 'Forest Picnic Table', description: 'A cheerful little bento for a long wait at the bus stop.', price: 3290, variations: [
    ["Totoro's Garden Bento", 'A colorful lunchbox for an afternoon in the garden.']
  ] }
];
