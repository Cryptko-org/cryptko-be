const cheerio = require('cheerio');
const axios = require('axios');
const qs = require('qs');
const ProductModel = require('../models/Products.model');

const promisesArr = [];

for (let page = 1; page < 26; page++) {
  const queries = qs.stringify({ page, ajax: 1 });
  promisesArr.push(axios(`https://jabko.ua/vinnytsia/iphone?${queries}`));
}

const getPhoneModelIdByTitle = (title) => {
  const lowerCaseTitle = title.toLowerCase();

  if (lowerCaseTitle.includes('iphone 14 pro max')) {
    return 'IPHONE_14_PRO_MAX';
  } else if (lowerCaseTitle.includes('iphone 14 pro')) {
    return 'IPHONE_14_PRO';
  } else if (lowerCaseTitle.includes('iphone 14 plus')) {
    return 'IPHONE_14_PLUS';
  } else if (lowerCaseTitle.includes('iphone 14')) {
    return 'IPHONE_14';
  } else if (lowerCaseTitle.includes('iphone 13 pro max')) {
    return 'IPHONE_13_PRO_MAX';
  } else if (lowerCaseTitle.includes('iphone 13 pro')) {
    return 'IPHONE_13_PRO';
  } else if (lowerCaseTitle.includes('iphone 13 mini')) {
    return 'IPHONE_13_MINI';
  } else if (lowerCaseTitle.includes('iphone 13')) {
    return 'IPHONE_13';
  } else if (lowerCaseTitle.includes('iphone 12 pro max')) {
    return 'IPHONE_12_PRO_MAX';
  } else if (lowerCaseTitle.includes('iphone 12 pro')) {
    return 'IPHONE_12_PRO';
  } else if (lowerCaseTitle.includes('iphone 12 mini')) {
    return 'IPHONE_12_MINI';
  } else if (lowerCaseTitle.includes('iphone 12')) {
    return 'IPHONE_12';
  } else if (lowerCaseTitle.includes('iphone 11 pro max')) {
    return 'IPHONE_11_PRO_MAX';
  } else if (lowerCaseTitle.includes('iphone 11 pro')) {
    return 'IPHONE_11_PRO';
  } else if (lowerCaseTitle.includes('iphone 11')) {
    return 'IPHONE_11';
  } else if (lowerCaseTitle.includes('iphone se') && lowerCaseTitle.includes('2022')) {
    return 'IPHONE_SE_2022';
  } else if (lowerCaseTitle.includes('iphone se') && lowerCaseTitle.includes('2020')) {
    return 'IPHONE_SE_2020';
  } else if (lowerCaseTitle.includes('iphone se')) {
    return 'IPHONE_SE';
  } else if (lowerCaseTitle.includes('iphone 8 plus')) {
    return 'IPHONE_8_PLUS';
  } else if (lowerCaseTitle.includes('iphone 8')) {
    return 'IPHONE_8';
  } else if (lowerCaseTitle.includes('iphone 7 plus')) {
    return 'IPHONE_7_PLUS';
  } else if (lowerCaseTitle.includes('iphone 7')) {
    return 'IPHONE_7';
  } else if (lowerCaseTitle.includes('iphone xr')) {
    return 'IPHONE_XR';
  } else if (lowerCaseTitle.includes('iphone xs max')) {
    return 'IPHONE_XS_MAX';
  } else if (lowerCaseTitle.includes('iphone xs')) {
    return 'IPHONE_XS';
  } else if (lowerCaseTitle.includes('iphone x')) {
    return 'IPHONE_X';
  }

  return 'IPHONE';
};

const getMemoryAmount = (title) => {
  const lowerCaseTitle = title.toLowerCase();

  if (lowerCaseTitle.includes('16gb')) {
    return '16GB';
  } else if (lowerCaseTitle.includes('32gb')) {
    return '32GB';
  } else if (lowerCaseTitle.includes('64gb')) {
    return '64GB';
  } else if (lowerCaseTitle.includes('128gb')) {
    return '128GB';
  } else if (lowerCaseTitle.includes('256gb')) {
    return '256GB';
  } else if (lowerCaseTitle.includes('512gb')) {
    return '512GB';
  } else if (lowerCaseTitle.includes('1tb')) {
    return '1TB';
  }

  return '0GB';
};

const getTypeByTitle = (title) => {
  const lowerCaseTitle = title.toLowerCase();

  if (lowerCaseTitle.includes('iphone')) {
    return 'IPHONE';
  }
};

const getIsUsedByTitle = (title) => {
  return title.toLowerCase().includes('б/у');
};

const getProductsInfo = async () => {
  try {
    const bnbToUahPrice = await getCurrencyInfo();

    return Promise.all([...promisesArr]).then((phonesPages) => {
      return phonesPages.flatMap((phonesPage) => {
        const $ = cheerio.load(phonesPage.data);
        const $products = $('.product_catalog_ .product-layout.product-grid .prod-item').toArray();

        return $products.map((product) => {
          const $product = cheerio.load(product);

          const smallImageLink = $product('.img-responsive').attr('data-img');
          const largeImageLink = $product('.img-responsive')
            .attr('data-img')
            .replace('420x420.jpg', '1397x1397.jpg');
          const title = $product('.slide-title .line-clamp-2').text();
          const priceUah = parseInt($product('.price-cur .uah .posr').text().split(' ').join(''));
          const priceBnb = parseFloat(priceUah / bnbToUahPrice);
          const countStars = +$product('.review-arate .ra-block .star_w.active').length;
          const maxStars = +$product('.review-arate .ra-block .star_w').length;
          const countViews = +$product('.default-review-text').text().slice(1, -1);
          const link = $product('.product_link').attr('href');
          const _id = $product('.product_link').attr('data-id');
          const isInStock = !$product('.price-cur-past.nopas').text();
          const modelId = getPhoneModelIdByTitle(title);
          const memoryId = getMemoryAmount(title);
          const type = getTypeByTitle(title);
          const isUsed = getIsUsedByTitle(title);

          return {
            _id,
            type,
            modelId,
            memoryId,
            smallImageLink,
            largeImageLink,
            title,
            priceUah: parseFloat((priceUah + (priceUah / 100) * 3).toFixed(5)), // +3% (5 symbols after dot)
            priceBnb: parseFloat((priceBnb + (priceBnb / 100) * 3).toFixed(5)), // +3% (5 symbols after dot)
            countStars,
            maxStars,
            countViews,
            link,
            isInStock,
            isUsed,
          };
        });
      });
    });
  } catch (e) {
    console.log('Error while updating prices! Error:', e.message);
  }
};

const getCurrencyInfo = async () => {
  return (
    await (
      await axios(
        'https://www.coinbase.com/graphql/query?operationName=ConversionToolFragmentRefetchQuery&extensions=%7B%22persistedQuery%22%3A%7B%22version%22%3A1%2C%22sha256Hash%22%3A%22956400996ae3d34bc3dd32796f787226bf7b6e4db19d55e0b0797703b5386cea%22%7D%7D&variables=%7B%22baseSymbol%22%3A%22BNB%22%2C%22country%22%3A%22UA%22%2C%22targetCurrency%22%3A%22UAH%22%7D'
      )
    ).data
  ).data.assetBySymbol.latestQuoteV3.price;
};

const updateProductInfo = async () => {
  try {
    const productsData = await getProductsInfo();
    const sortedProducts = productsData.sort((productA, productB) => +productA._id - +productB._id);

    await ProductModel.deleteMany({});
    await ProductModel.insertMany(sortedProducts);

    return sortedProducts;
  } catch (e) {
    console.log('Error while updating product info! Error:', e.message);
  }
};

module.exports = updateProductInfo;
