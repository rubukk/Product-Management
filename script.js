document.addEventListener('DOMContentLoaded', () => {
    const productList = document.getElementById('product-list');
    const productForm = document.getElementById('product-form');
    const productIdInput = document.getElementById('product-id');
    const productTitleInput = document.getElementById('product-title');
    const productPriceInput = document.getElementById('product-price');
    const productImageInput = document.getElementById('product-image');
    const submitBtn = document.getElementById('submit-btn');

    let products = JSON.parse(localStorage.getItem('products')) || [];

    function saveProducts() {
        localStorage.setItem('products', JSON.stringify(products));
    }

    function fetchProductsFromAPI() {
        fetch('https://fakestoreapi.com/products')
            .then(response => response.json())
            .then(data => {
                products = [...data, ...products];
                saveProducts();
                renderProducts();
            })
            .catch(error => console.error('Error fetching products:', error));
    }

    function renderProducts() {
        productList.innerHTML = '';
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'col-md-4 mb-4';
            productCard.innerHTML = `
                <div class="card product-card">
                    <img src="${product.image}" class="card-img-top" alt="${product.title}">
                    <div class="card-body">
                        <h5 class="card-title">${product.title}</h5>
                        <p class="card-text">$${product.price}</p>
                        <button class="btn btn-primary edit-btn" data-id="${product.id}">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button class="btn btn-danger delete-btn" data-id="${product.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            productList.appendChild(productCard);
        });
    }

    function addProduct(product) {
        const newProduct = {
            ...product,
            id: Date.now() 
        };
        products.push(newProduct);
        saveProducts();
        renderProducts();
    }

    function updateProduct(id, updatedProduct) {
        const productIndex = products.findIndex(p => p.id === id);
        if (productIndex > -1) {
            fetch(`https://fakestoreapi.com/products/${id}`, {
                method: 'PUT',
                body: JSON.stringify(updatedProduct),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(res => res.json())
            .then(() => {
                products[productIndex] = updatedProduct;
                saveProducts();
                renderProducts();
            })
            .catch(error => console.error('Error updating product:', error));
        }
    }

    function deleteProduct(id) {
        fetch(`https://fakestoreapi.com/products/${id}`, {
            method: 'DELETE'
        })
        .then(() => {
            products = products.filter(product => product.id !== id);
            saveProducts();
            renderProducts();
        })
        .catch(error => console.error('Error deleting product:', error));
    }

    function editProduct(id) {
        const product = products.find(p => p.id === id);
        if (product) {
            productIdInput.value = product.id;
            productTitleInput.value = product.title;
            productPriceInput.value = product.price;
            productImageInput.value = product.image;
            submitBtn.textContent = 'Update Product';
        }
    }

    productForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const id = parseInt(productIdInput.value);
        const title = productTitleInput.value;
        const price = parseFloat(productPriceInput.value);
        const image = productImageInput.value;

        const product = { title, price, image };

        if (id) {
            updateProduct(id, { id, ...product });
        } else {
            addProduct(product);
        }

        productForm.reset();
        productIdInput.value = '';
        submitBtn.textContent = 'Add Product';
    });

    productList.addEventListener('click', (event) => {
        const button = event.target.closest('button');
        if (button) {
            const id = parseInt(button.getAttribute('data-id'));

            if (button.classList.contains('edit-btn')) {
                editProduct(id);
            } else if (button.classList.contains('delete-btn')) {
                deleteProduct(id);
            }
        }
    });

    fetchProductsFromAPI();
});
