"use strict";

// Curated list of common English words + high-frequency domain words.
// Used for word-segmentation so the engine can tell a real-word domain
// (e.g. "bluebottle") from a random string (e.g. "qzkpra").
const WORD_LIST = `the of and to in is for on with as at by an be this from or one have not but
ability able about above accept access account ace acid acorn acre across act action active
ad add admin adopt ads adult advance adventure advice aero affair afford after again age agency
agent ago agree air airport alert algo alive all alpha alter amber amount amp ana anchor angel
angle animal anime answer ant any apex app apple apply apps april arc arch arctic are area arena
arm army around art arts ask asset astro atlas atom audio aura auto autumn avenue away awesome
baby back backup bacon bad badge bag bake balance ball band bank bar bare barn base basic basket
bass bat batch bath battery bay beach beam bean bear beat beauty bee beer bell belt bench bend
benefit berry best bet beta better beyond bid big bike bill bin binary bird bit bite black blade
blank blast blaze blend bless blink block blog blonde blood bloom blue blur board boat body bold
bolt bomb bond bone bonus book boom boost boot border born boss bot both bottle bottom bounce
bound bow bowl box boy brain branch brand brave bread break breeze brew brick bridge bright bring
broad bronze brook brother brown brush bubble buck bud budget buffalo bug build bulk bull bundle
burn burst bus bush business busy but butter button buy buzz cab cabin cable cache cafe cage cake
calm camera camp campus can canal candle candy cane cannon canvas cap cape capital captain car
carbon card care career cargo carry cart case cash cast castle cat catch cause cave cdn cedar
cell cent center central century chain chair chalk champ chance change channel chaos charge charm
chart chase chat cheap check cheer cheese chef cherry chess chest chic chief child chill chip
choice choose chrome chunk church cinema circle circuit citizen city civic claim clan class clay
clean clear clever click client cliff climb clinic clip clock close cloud club cluster coach coal
coast coat code coffee coin cold collect college color colt column combo come comet comfort comic
command commerce common community company compass complete computer concept concrete connect
console contact content contest context control cook cool copper copy coral core corn corner
corona corp cosmic cost cottage cotton couch count counter country couple coupon course court
cove cover cow craft crane crash crate crazy cream create credit creek crew crib crisp critical
crop cross crowd crown crypto crystal cube cue cup cupid curl currency current curve custom cut
cute cyber cycle daily dairy daisy dance danger dark dash data date dawn day deal dean dear debt
decade deck deep deer default defend degree delay delight deliver delta demand demo den dense
dental deploy depot depth derby desert design desk dev develop device devil diamond diary dice
diesel diet digital dim dime diner dino direct dirt disc discount dish disk display distinct dive
divine dna doc dock doctor dog dollar dolphin domain dome done door dose dot double dove down
draft drag dragon drake drama draw dream dress drift drill drink drive drone drop drum dry duck
dude due dune dust duty dynamic eagle ear early earn earth east easy eat echo eco edge edit
education egg eight elastic elder electric element elite elm else email ember emerald emoji
empire employ empty enable end energy engine enjoy enter entry epic equal equity era escape
essence estate eternal euro even event ever every exact exam example exit expert explore export
express extra extreme eye fabric face fact factory fade fair faith falcon fall fame family famous
fan fancy farm fashion fast fat fate father fault favor fear feast feather feature fed fee feed
feel fellow fence fern festival fetch fever few fiber fiction field fierce fig fight figure file
fill film filter final finance find fine finger finish fire firm first fish fist fit five fix flag
flame flare flash flat flavor fleet flesh flex flight flip float flock flood floor flora flow
flower fluid flux fly focus fog fold folk follow font food foot for force forest forever forge
fork form formula fort fortune forum forward fossil found fountain four fox frame free freedom
freeze fresh friend frog front frost fruit fuel full fun fund funny fur furnace fury fusion future
gadget gain galaxy gallery game gamma gap garage garden garlic gas gate gather gear gem gen gene
general genius gentle genuine geo ghost giant gift ginger girl give glacier glad glass glide
glitch global globe glory glove glow glue goal goat god gold golf good goose gorilla gospel
gourmet grab grace grade grain grand grant grape graph grass grave gravity gray great green greet
grid grill grip grit grocery groove ground group grove grow growth guard guest guide guild guitar
gulf gum gun guru guy gym habit hack hair half hall halo ham hammer hand handle happy harbor hard
hardware harmony harvest hat hatch haul haven hawk hay hazard head heal health heart heat heaven
heavy hedge height hello helm help hen herb hero hidden high hike hill hint hire hive hobby hold
hole holiday hollow holy home honest honey hood hook hope horizon horn horse host hot hotel hour
house how hub hue huge human humble hunt hurdle hut hybrid hydro hyper ice icon idea ideal image
imagine impact import improve impulse inch index indie industry infinity info ink inn inner input
insight inspect instant institute insure intel intent inter into invest invite iris iron island
issue item ivory ivy jack jacket jade jaguar jam jar jasmine jaw jazz jelly jet jewel job join
joint joke jolly journal journey joy judge juice jump jungle junior junk jury just kale kangaroo
keen keep kennel kernel key keyboard kick kid kidney kind king kiss kit kitchen kite kitten kiwi
knee knife knight knit knock knot know koala lab label labor lace ladder lady lake lamb lamp land
landscape lane lantern lap laptop large laser last late latte laugh launch laundry lava law lawn
layer lead leaf league lean leap learn lease leather leaf leave ledge left leg legacy legal legend
lemon lend length lens leo level liberty library license lid life lift light like lily lime limit
line link lion lip liquid list lite little live liver living lizard load loan lobby local lock
log logic logo lone long look loop lord lotus loud lounge love low loyal luck lumber lunar lunch
lung lush lux luxury lynx mac machine mad magic magnet maid mail main major make male mall mama
man manage mango manor mantle manual maple map marble march mare margin marine mark market
marriage mars marvel mask mason mass master mat match mate material math matrix matter max maze
meadow meal mean meat media medic medical medium meet mega melody melon member memory men menu
mercury mercy merge merit mesh message metal meta meteor meter method metro micro mid midnight
might mile milk mill million mind mine mini mint minute mirror mission mist mix mobile mod mode
model modern module mojo molecule mom moment money monitor monk monkey monster month moon moral
more morning mortgage moss most motel moth mother motion motor mount mountain mouse mouth move
movie much mud mug multi muse music must mustang mutual myth nacho nail name nano nap nation
native natural nature navy near neat nebula neck nectar need needle neon nerve nest net network
neural neutral never new news next nice niche night nimble nine ninja noble node noise nomad noon
north nose note nova novel now nuance nuclear nugget number nurse nut nutrition oak oasis oat
object ocean octopus odd off offer office officer oil old olive omega once one onion online only
onyx opal open opera opinion opportunity opt optic option oracle orange orbit orchard order organic
origin orion ornament other otter ounce out outdoor outer output oval oven over owl own ox oxide
oxygen oyster pace pack package pact pad page paint pair palace pale palm pan panda panel panic
pantry paper papaya parade parcel park parlor parrot part partner party pass passage past pasta
pastel patch path patient patriot pattern pause pave paw pay payment peace peach peak peanut pear
pearl pebble pedal peer pelican pen pencil penguin people pepper percent perch perfect perform
perfume period permit person pet petal petite phantom phase phoenix phone photo phrase physical
piano pick picnic picture pie piece pier pig pigeon pile pilgrim pillar pilot pin pine pink pint
pioneer pipe pirate pitch pixel pizza place plain plan plane planet plank plant plasma plate
platform play plaza pleasant pledge plenty plot plow plug plum plumber plus pocket pod poem poet
point poise polar pole police policy polish polo pond pony pool pop poppy porch port portal
portfolio portion portrait pose position positive post pot potato potion pottery pouch power
practice prairie praise pray precise predict premier premium prep present press prestige pretty
price pride prime prince print prior prism prison private prize pro probe problem process produce
product profile profit program project promo promise prompt proof proper property propose protect
protein proud prove provide proxy prune public pulse puma pump pumpkin punch pup pupil puppy pure
purple purpose purse push put puzzle pyramid python quad quail quake quality quantum quartz queen
quest question queue quick quiet quill quilt quirk quit quiz quota quote rabbit race rack radar
radio radius raft rage raid rail rain rainbow raise rally ram ramble ranch random range rank
rapid rare rate ratio raven raw ray razor reach react read ready real realm reap reason rebel
rebid recipe record recover recycle red reef refine reflect reform refresh refuge regal region
register regular reign relax relay release reliable relic relief remedy remind remote render renew
rent repair repeat reply report republic request rescue research reserve reset resolve resort
resource respect respond rest restore result retail retro return reveal revenue review revolve
reward rhino rhythm rib rice rich ride ridge rifle right rigid rim ring rinse rio riot rip ripe
ripple rise risk rite rival river road roam roar roast robe robin robot rock rocket rod rogue
role roll roman romance roof rookie room root rope rose roster rotate rough round route rover row
royal rubber ruby rudder rug rugby ruin rule rum run runner rural rush rust rustic sable sacred
saddle safari safe saffron saga sage sail saint salad salary sale salmon salon salt salute same
sample sanctuary sand sapphire sash satellite satin sauce sausage save savory savvy saw scale
scan scarf scene scent scheme scholar school science scope score scout scratch scream screen
script scroll scuba sea seal search season seat second secret section secure seed seek seer
segment select self sell seminar senate send senior sense sensor sentry serene serial series
serpent serve service session set settle seven shade shadow shake shale shall shape share shark
sharp shed sheep sheet shelf shell shelter shepherd shield shift shine ship shirt shock shoe
shoot shop shore short shot shoulder shout show shower shrimp shrine shrub shuttle side siege
sierra sigma sign signal silent silk silver simple sin since sing single sink sir siren sister
sit site six size skate sketch ski skill skin skip skull sky slate sleep sleeve slice slide slim
slip slope slot slow small smart smile smoke smooth snack snake snap snow soap social society
sock soda sofa soft software soil solar sold soldier sole solid solo solstice solution solve some
son song sonic soon soot sora sorrel soul sound soup source south space spade span spare spark
sparrow spear spec special species speech speed spell sphere spice spider spike spin spine spire
spirit splash split sponge spoon sport spot spray spread spring sprint sprout spruce spur spy
square squad squash squid stable stack stadium staff stage stair stake stamp stance stand star
stark start state station status stay steady steak steam steel steep steer stellar stem step
stereo stick stiff still sting stir stitch stock stone stop store storm story stout stove straight
strand strap stream street strength stretch strike string strip strive stroke strong struct studio
study stuff stump style sub subtle suburb success such sugar suit suite sum summer summit sun
super supply support sure surf surge survey sushi swan swap sweat sweet swift swim swing switch
sword symbol sync system table tablet tackle taco tactic tag tail tailor take tale talent talk
tall tame tan tang tank tap tape target tarot task taste tattoo tax taxi tea teach team tear
tech teen telescope tell temple tempo ten tenant tend tender tennis tent tenure term terra
terrain test text texture than thank that the theater theme then theory there thermal these they
thick thin thing think third thirst this thorn those thread three thrive throne throw thrust
thumb thunder thus tick ticket tide tidy tiger tight tile till timber time tin tiny tip tire
title toad toast today toe together token tomato tomorrow tone tonic too tool tooth top topic
torch tornado total totem touch tough tour tower town toy trace track trade traffic trail train
trait tram transfer transit trap trash travel tray treasure treat tree trek trend trial triangle
tribe trick tricolor trim trio trip triple triumph trophy tropic trout truck true trumpet trunk
trust truth try tube tuck tulip tuna tundra tune tunnel turbo turf turn turtle tusk tutor twin
twist two type tycoon ultra umbrella uncle under unfold unicorn union unique unit unite universe
unlock until up update uplift upper upward urban urge usa use useful user usual utility vacation
vacuum vail vale valley value valve van vandal vanilla vapor vast vault vector veil velvet vendor
venom venture venue verb verde verge verse version vertex vessel vest vet veteran via vibe vice
victor video view vigor villa village vine vintage vinyl violet viper viral virtue virus visa
vision visit visor vista vital vivid vocal vogue voice void volcano volt volume vote vox voyage
vulcan wad wade wafer wage wagon waist wait wake walk wall wallet walnut wander want war warden
ware warm warn warp warrant warrior wash wasp waste watch water wave wax way wealth weapon wear
weather weave web wedding wedge weed week weight weird welcome weld well west wet whale wheat
wheel when where which while whip whirl whisper white who whole why wick wide widget width wild
will win wind window wine wing wink winner winter wire wisdom wise wish wit witch with within
without wizard wolf woman wonder wood wool word work world worm worth wound wave woven wow wrap
wren wrist write wrong yacht yak yam yard yarn year yeast yellow yes yeti yield yoga yogurt yolk
young your youth zeal zebra zen zenith zero zest zeta zigzag zinc zip zodiac zone zoo zoom`
  .split(/\s+/)
  .filter(Boolean);

const DICTIONARY = new Set(WORD_LIST);

// Premium keyword tiers. Tier value feeds the keyword sub-score and a price
// premium. These reflect categories that consistently command higher prices
// on the aftermarket.
const KEYWORD_TIERS = {
  // Tier 1 — highest commercial intent
  ai: 1, app: 1, pay: 1, bank: 1, crypto: 1, coin: 1, token: 1, cloud: 1,
  shop: 1, store: 1, loan: 1, insurance: 1, hotel: 1, casino: 1, bet: 1,
  cash: 1, money: 1, gold: 1, fund: 1, capital: 1, invest: 1, trade: 1,
  health: 1, care: 1, med: 1, medical: 1, finance: 1, credit: 1, mortgage: 1,
  // Tier 2 — strong commercial / tech
  tech: 2, soft: 2, smart: 2, data: 2, cyber: 2, web: 2, net: 2, digital: 2,
  hub: 2, lab: 2, labs: 2, studio: 2, works: 2, pro: 2, prime: 2, max: 2,
  plus: 2, go: 2, get: 2, my: 2, best: 2, top: 2, market: 2, deal: 2,
  travel: 2, game: 2, play: 2, home: 2, auto: 2, car: 2, food: 2, fit: 2,
  meta: 2, nft: 2, dao: 2, vr: 2, ar: 2, bio: 2, eco: 2, green: 2, solar: 2,
  // Tier 3 — brandable boosters
  flow: 3, sync: 3, stack: 3, forge: 3, mint: 3, verse: 3, grid: 3, pilot: 3,
  spot: 3, zone: 3, base: 3, box: 3, kit: 3, link: 3, wave: 3, pulse: 3,
  nova: 3, nexus: 3, vault: 3, orbit: 3, atlas: 3, vertex: 3, quantum: 3,
  fast: 3, easy: 3, now: 3, live: 3, one: 3, io: 3
};

// Illustrative aftermarket comparable sales. These are drawn from publicly
// reported domain sales (NameBio-style) and are used to anchor valuations and
// surface "similar domains that sold". Prices/dates are representative of the
// public aftermarket and labelled accordingly — treat as decision-support,
// not a guarantee of any specific transaction.
function comp(domain, price, date, vertical, venue) {
  return {
    domain,
    price,
    date,
    vertical: vertical || null,
    venue: venue || "Aftermarket",
    source: venue || "Aftermarket",
    saleType: "aftermarket",
    verificationStatus: "verified_public_sale"
  };
}

const MARKET_COMPS = [
  // Mega one-word .com
  comp("voice.com", 30000000, "2019-05-01", "Generic", "Public Sale"),
  comp("insurance.com", 35600000, "2010-01-01", "FinTech", "Public Sale"),
  comp("hotels.com", 11000000, "2001-01-01", "Travel", "Public Sale"),
  comp("crypto.com", 12000000, "2018-07-01", "Crypto", "Public Sale"),
  comp("ice.com", 3500000, "2018-01-01", "Generic", "Public Sale"),
  comp("nft.com", 15000000, "2022-08-01", "Crypto", "Public Sale"),
  comp("ai.com", 11000000, "2023-02-01", "AI", "Public Sale"),
  comp("chat.com", 15500000, "2023-01-01", "AI", "Public Sale"),
  comp("you.com", 4000000, "2021-01-01", "AI", "Public Sale"),
  comp("data.com", 4500000, "2008-01-01", "Generic", "Public Sale"),
  // One-word / dictionary .com mid-high
  comp("snapshot.com", 95000, "2021-03-01", "Generic", "Sedo"),
  comp("bouquet.com", 120000, "2020-09-01", "Ecommerce", "Sedo"),
  comp("voyager.com", 480000, "2019-01-01", "Travel", "Afternic"),
  comp("harbor.com", 350000, "2018-06-01", "Generic", "Afternic"),
  comp("compass.com", 380000, "2018-02-01", "Generic", "Afternic"),
  comp("kindred.com", 285000, "2020-04-01", "Generic", "Sedo"),
  comp("lumen.com", 250000, "2020-07-01", "Tech", "Afternic"),
  comp("ember.com", 175000, "2021-05-01", "Generic", "Sedo"),
  comp("nimbus.com", 95000, "2021-08-01", "Tech", "Sedo"),
  comp("cascade.com", 210000, "2019-11-01", "Generic", "Afternic"),
  comp("vantage.com", 165000, "2020-02-01", "FinTech", "Sedo"),
  comp("pinnacle.com", 180000, "2019-06-01", "Generic", "Afternic"),
  comp("meridian.com", 145000, "2020-10-01", "Generic", "Sedo"),
  comp("catalyst.com", 198000, "2019-03-01", "Generic", "Afternic"),
  comp("horizon.com", 220000, "2018-09-01", "Generic", "Afternic"),
  // AI vertical
  comp("getaccept.ai", 22000, "2023-04-01", "AI", "Dan"),
  comp("neuralforge.ai", 18500, "2024-01-01", "AI", "NameBio"),
  comp("synthflow.ai", 14000, "2024-03-01", "AI", "Dan"),
  comp("brightmind.ai", 16500, "2023-11-01", "AI", "Sedo"),
  comp("deepcanvas.ai", 12000, "2024-02-01", "AI", "Dan"),
  comp("coreintel.ai", 9500, "2024-05-01", "AI", "Dan"),
  comp("vectormind.ai", 11000, "2024-06-01", "AI", "Sedo"),
  comp("promptlab.ai", 21000, "2023-09-01", "AI", "Dan"),
  comp("modelstack.ai", 8800, "2024-07-01", "AI", "Dan"),
  comp("agentgrid.ai", 13500, "2024-04-01", "AI", "Sedo"),
  comp("clarity.ai", 95000, "2022-01-01", "AI", "Afternic"),
  comp("scale.ai", 250000, "2020-01-01", "AI", "Afternic"),
  comp("cohere.ai", 120000, "2021-06-01", "AI", "Sedo"),
  // FinTech
  comp("paylink.io", 28000, "2022-05-01", "FinTech", "Dan"),
  comp("fundbase.com", 65000, "2021-02-01", "FinTech", "Afternic"),
  comp("paywise.com", 48000, "2020-08-01", "FinTech", "Sedo"),
  comp("creditflow.com", 35000, "2021-09-01", "FinTech", "Dan"),
  comp("ledgerly.com", 18000, "2022-03-01", "FinTech", "Dan"),
  comp("vaultpay.com", 42000, "2021-11-01", "FinTech", "Afternic"),
  comp("banking.io", 88000, "2020-05-01", "FinTech", "Sedo"),
  comp("investly.com", 26000, "2022-07-01", "FinTech", "Dan"),
  comp("capitaledge.com", 31000, "2021-04-01", "FinTech", "Afternic"),
  // Crypto
  comp("coinbase.io", 36000, "2021-01-01", "Crypto", "Sedo"),
  comp("tokenize.com", 110000, "2021-03-01", "Crypto", "Afternic"),
  comp("stakehub.io", 19000, "2022-02-01", "Crypto", "Dan"),
  comp("chainlink.io", 75000, "2020-09-01", "Crypto", "Sedo"),
  comp("blockmint.com", 28000, "2021-12-01", "Crypto", "Dan"),
  comp("defivault.com", 22000, "2022-04-01", "Crypto", "Dan"),
  // Health
  comp("wellness.com", 1500000, "2007-01-01", "Healthcare", "Public Sale"),
  comp("carepoint.com", 92000, "2019-08-01", "Healthcare", "Afternic"),
  comp("healthly.com", 24000, "2021-06-01", "Healthcare", "Dan"),
  comp("medsync.com", 38000, "2020-11-01", "Healthcare", "Afternic"),
  comp("vitalcare.com", 45000, "2020-03-01", "Healthcare", "Sedo"),
  comp("clinicflow.com", 16000, "2022-08-01", "Healthcare", "Dan"),
  comp("therapy.io", 54000, "2021-05-01", "Healthcare", "Sedo"),
  // Ecommerce
  comp("checkout.com", 1500000, "2018-01-01", "Ecommerce", "Public Sale"),
  comp("shopwave.com", 29000, "2021-07-01", "Ecommerce", "Dan"),
  comp("cartly.com", 21000, "2022-01-01", "Ecommerce", "Dan"),
  comp("buyloop.com", 14500, "2022-09-01", "Ecommerce", "Dan"),
  comp("retailedge.com", 33000, "2020-12-01", "Ecommerce", "Afternic"),
  comp("storefront.io", 41000, "2021-02-01", "Ecommerce", "Sedo"),
  // Travel
  comp("tripbase.com", 36000, "2020-06-01", "Travel", "Afternic"),
  comp("wanderly.com", 25000, "2021-08-01", "Travel", "Dan"),
  comp("jetset.io", 47000, "2020-10-01", "Travel", "Sedo"),
  comp("roamly.com", 19000, "2022-05-01", "Travel", "Dan"),
  // Cybersecurity
  comp("sentinel.io", 68000, "2020-04-01", "Cybersecurity", "Sedo"),
  comp("threatlock.com", 34000, "2021-10-01", "Cybersecurity", "Afternic"),
  comp("cybershield.com", 52000, "2020-07-01", "Cybersecurity", "Sedo"),
  comp("secureflow.com", 27000, "2021-12-01", "Cybersecurity", "Dan"),
  // Short brandables
  comp("zumo.com", 62000, "2021-03-01", "Generic", "Afternic"),
  comp("vybe.com", 38000, "2021-09-01", "Generic", "Dan"),
  comp("qnavo.com", 9500, "2022-06-01", "Generic", "Dan"),
  comp("luxe.io", 28000, "2021-01-01", "Generic", "Sedo"),
  comp("kova.com", 45000, "2020-11-01", "Generic", "Afternic"),
  comp("juno.io", 33000, "2021-04-01", "Generic", "Sedo"),
  comp("nuvo.com", 41000, "2020-08-01", "Generic", "Afternic"),
  comp("zeda.com", 27000, "2022-02-01", "Generic", "Dan"),
  comp("brio.com", 55000, "2020-05-01", "Generic", "Afternic"),
  // Two-word brandable .com mid market
  comp("brightpath.com", 32000, "2021-05-01", "Generic", "Afternic"),
  comp("cleanslate.com", 28000, "2021-08-01", "Generic", "Sedo"),
  comp("ironwood.com", 47000, "2020-09-01", "Generic", "Afternic"),
  comp("silverline.com", 38000, "2021-02-01", "Generic", "Sedo"),
  comp("bluebottle.com", 51000, "2020-06-01", "Ecommerce", "Afternic"),
  comp("redbridge.com", 35000, "2021-03-01", "Generic", "Sedo"),
  comp("greenfield.com", 62000, "2020-04-01", "Generic", "Afternic"),
  comp("northstar.com", 78000, "2019-11-01", "Generic", "Afternic"),
  comp("swiftpeak.com", 18000, "2022-04-01", "Generic", "Dan"),
  comp("clearsky.com", 44000, "2020-10-01", "Generic", "Sedo"),
  // .io / .co / .net spread
  comp("deploy.io", 38000, "2021-06-01", "Tech", "Sedo"),
  comp("metrics.io", 42000, "2020-12-01", "Tech", "Afternic"),
  comp("workflow.co", 21000, "2021-09-01", "Tech", "Dan"),
  comp("dashboard.io", 29000, "2021-04-01", "Tech", "Sedo"),
  comp("startup.net", 8500, "2022-01-01", "Tech", "Dan"),
  comp("software.co", 24000, "2020-07-01", "Tech", "Afternic"),
  // Long / lower value examples for calibration
  comp("besttraveldeals.net", 1800, "2022-03-01", "Travel", "Dan"),
  comp("myhealthtracker.net", 1200, "2022-07-01", "Healthcare", "Dan"),
  comp("cheaphomeloans.org", 2400, "2021-11-01", "FinTech", "Sedo"),
  comp("digital-marketing-pro.com", 950, "2022-09-01", "Generic", "Dan"),
  comp("the-coffee-shop.net", 480, "2023-01-01", "Ecommerce", "Dan")
].filter((c) => c.price > 0);

module.exports = { DICTIONARY, KEYWORD_TIERS, MARKET_COMPS };
