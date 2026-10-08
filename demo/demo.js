import { initFluent2 } from '../src/js/index.js';

initFluent2();

document.querySelector('[data-demo-login]')?.addEventListener('submit', (event) => {
  event.preventDefault();
  document.querySelector('#login-status').textContent =
    'This demonstration does not connect to an account.';
});

const store = document.querySelector('[data-store]');

if (store) {
  const products = {
    planner: {
      name: 'Focus Planner',
      category: 'Plan with intention',
      price: 18,
      icon: '✎',
      color: '#6750a4',
      rating: 4.8,
      ratingCount: 126,
      description:
        'A thoughtful undated planner with room for weekly priorities, daily notes, and the little wins along the way.',
      reviews: [
        {
          name: 'Jamie Chen',
          rating: 5,
          text: 'Just enough structure to help me focus without making every hour feel spoken for.',
        },
        {
          name: 'Taylor Reed',
          rating: 4,
          text: 'The weekly reflection page has become a lovely Friday ritual.',
        },
      ],
    },
    timer: {
      name: 'Desk Timer',
      category: 'Make space for focus',
      price: 32,
      icon: '◷',
      color: '#006b6b',
      rating: 4.6,
      ratingCount: 84,
      description:
        'A simple, tactile timer for creating a little space between distractions and the work that matters.',
      reviews: [
        {
          name: 'Sam Patel',
          rating: 5,
          text: 'A small change that made my focus blocks feel much more intentional.',
        },
        {
          name: 'Morgan Bell',
          rating: 4,
          text: 'Easy to use and looks great on my desk.',
        },
      ],
    },
    journal: {
      name: 'Everyday Journal',
      category: 'Capture the in-between',
      price: 14,
      icon: '▤',
      color: '#975c00',
      rating: 4.9,
      ratingCount: 58,
      description:
        'A soft-cover, lay-flat journal for collecting quick thoughts, curious questions, and ideas still taking shape.',
      reviews: [
        {
          name: 'Rowan Lee',
          rating: 5,
          text: 'Paper that makes me want to put my phone down and write.',
        },
        {
          name: 'Casey Kim',
          rating: 5,
          text: 'I keep one at home and one in my bag.',
        },
      ],
    },
  };
  const cart = new Map();
  const cartItems = store.querySelector('#store-cart-items');
  const cartCount = store.querySelector('#store-cart-count');
  const cartTotal = store.querySelector('#store-cart-total');
  const cartEmpty = store.querySelector('#store-cart-empty');
  const cartContents = store.querySelector('#store-cart-contents');
  const status = store.querySelector('#store-status');
  const detail = store.querySelector('#store-product-detail');
  const reviewForm = store.querySelector('#store-review-form');
  let selectedProduct = 'planner';

  const makeElement = (tagName, className, text) => {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };

  const updateCart = () => {
    cartItems.replaceChildren();
    let quantityTotal = 0;
    let priceTotal = 0;

    for (const [id, quantity] of cart) {
      const product = products[id];
      quantityTotal += quantity;
      priceTotal += product.price * quantity;
      const row = makeElement('div', 'store-cart-item');
      const label = makeElement('span');
      label.append(
        makeElement('strong', '', product.name),
        document.createElement('br'),
        makeElement('span', 'cms-meta', `${quantity} × $${product.price.toFixed(2)}`),
      );
      const remove = makeElement('button', 'button is-small is-light', 'Remove');
      remove.type = 'button';
      remove.setAttribute('aria-label', `Remove ${product.name} from cart`);
      remove.addEventListener('click', () => {
        cart.delete(id);
        updateCart();
        status.textContent = `${product.name} removed from your cart.`;
      });
      row.append(label, remove);
      cartItems.append(row);
    }

    cartCount.textContent = String(quantityTotal);
    cartTotal.textContent = `$${priceTotal.toFixed(2)}`;
    cartEmpty.hidden = quantityTotal > 0;
    cartContents.hidden = quantityTotal === 0;
  };

  const renderReviews = (product) => {
    const reviews = detail.querySelector('#store-reviews');
    reviews.replaceChildren();
    for (const review of product.reviews) {
      const article = makeElement('article', 'store-review');
      const heading = makeElement('h4', 'title is-6 mb-2', review.name);
      const rating = makeElement('p', 'store-rating mb-2', `${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)} ${review.rating} out of 5`);
      rating.setAttribute('aria-label', `${review.rating} out of 5 stars`);
      const comment = makeElement('p', '', review.text);
      article.append(heading, rating, comment);
      reviews.append(article);
    }
    detail.querySelector('#store-rating-summary').textContent =
      `${product.rating.toFixed(1)} out of 5 · ${product.ratingCount} ratings`;
  };

  const showProduct = (id) => {
    const product = products[id];
    selectedProduct = id;
    detail.querySelector('#store-detail-category').textContent = product.category;
    detail.querySelector('#store-detail-name').textContent = product.name;
    detail.querySelector('#store-detail-description').textContent = product.description;
    detail.querySelector('#store-detail-price').textContent = `$${product.price.toFixed(2)}`;
    detail.querySelector('#store-detail-art').style.setProperty('--product-color', product.color);
    detail.querySelector('#store-detail-icon').textContent = product.icon;
    detail.querySelector('#store-add-selected').setAttribute('data-add-to-cart', id);
    renderReviews(product);
  };

  store.querySelectorAll('[data-view-product]').forEach((button) => {
    button.addEventListener('click', () => {
      showProduct(button.dataset.viewProduct);
      detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  store.addEventListener('click', (event) => {
    const button = event.target.closest('[data-add-to-cart]');
    if (!button) return;
    const id = button.dataset.addToCart;
    cart.set(id, (cart.get(id) ?? 0) + 1);
    updateCart();
    status.textContent = `${products[id].name} added to your cart.`;
  });

  reviewForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(reviewForm);
    const rating = Number(formData.get('rating'));
    products[selectedProduct].reviews.unshift({
      name: formData.get('reviewer').trim(),
      rating,
      text: formData.get('comment').trim(),
    });
    renderReviews(products[selectedProduct]);
    status.textContent = `Your ${rating}-star review for ${products[selectedProduct].name} was added.`;
    reviewForm.reset();
  });

  showProduct(selectedProduct);
  updateCart();
}
