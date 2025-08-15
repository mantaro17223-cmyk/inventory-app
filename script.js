document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('add-item-form');
    const tableBody = document.getElementById('inventory-body');
    const searchInput = document.getElementById('search-input');

    let inventory = JSON.parse(localStorage.getItem('inventory')) || [];

    // 日付を整形するヘルパー関数
    const getFormattedDate = () => {
        const now = new Date();
        return `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    };

    const renderTable = (itemsToRender) => {
        tableBody.innerHTML = '';
        
        if (itemsToRender.length === 0) {
            const row = tableBody.insertRow();
            const cell = row.insertCell();
            // ↓↓↓ 変更点：列が5つになったのでcolspanを5に変更 ↓↓↓
            cell.colSpan = 5;
            cell.textContent = '該当する商品はありません';
            cell.style.textAlign = 'center';
            return;
        }

        itemsToRender.forEach(item => {
            const row = tableBody.insertRow();
            // ↓↓↓ 変更点：「操作」ボタンの列を復活 ↓↓↓
            // 各ボタンに一意のIDをdata-id属性として付与
            row.innerHTML = `
                <td>${item.name}</td>
                <td>${item.location}</td>
                <td>${item.quantity}</td>
                <td>${item.lastUpdated}</td>
                <td>
                    <button class="action-btn btn-increase" data-id="${item.id}">+</button>
                    <button class="action-btn btn-decrease" data-id="${item.id}">-</button>
                    <button class="action-btn btn-delete" data-id="${item.id}">削除</button>
                </td>
            `;
        });
    };

    const saveInventory = () => {
        localStorage.setItem('inventory', JSON.stringify(inventory));
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault(); 
        const itemNameInput = document.getElementById('item-name');
        const itemLocationInput = document.getElementById('item-location');
        const itemQuantityInput = document.getElementById('item-quantity');
        
        const newItem = {
            // ↓↓↓ 変更点：商品を一意に識別するためのIDを復活 ↓↓↓
            id: Date.now(),
            name: itemNameInput.value,
            location: itemLocationInput.value,
            quantity: parseInt(itemQuantityInput.value, 10),
            lastUpdated: getFormattedDate()
        };

        inventory.push(newItem);
        saveInventory();
        searchInput.value = '';
        renderTable(inventory);
        form.reset();
    });

    // ↓↓↓ 変更点：テーブル内のボタンクリックイベント処理を復活・更新 ↓↓↓
    tableBody.addEventListener('click', (e) => {
        const target = e.target;
        // data-id属性から操作対象の商品のIDを取得
        const id = parseInt(target.getAttribute('data-id'), 10);

        if (target.classList.contains('action-btn')) {
            const item = inventory.find(i => i.id === id);
            
            if (item) {
                // 在庫を増やす
                if (target.classList.contains('btn-increase')) {
                    item.quantity++;
                    item.lastUpdated = getFormattedDate(); // 更新日を更新
                }
        
                // 在庫を減らす
                if (target.classList.contains('btn-decrease')) {
                    if (item.quantity > 0) {
                        item.quantity--;
                        item.lastUpdated = getFormattedDate(); // 更新日を更新
                    }
                }
        
                // 商品を削除する
                if (target.classList.contains('btn-delete')) {
                    if (confirm(`「${item.name}」を削除しますか？`)) {
                        inventory = inventory.filter(i => i.id !== id);
                    }
                }
            }
            
            saveInventory();
            filterAndRender(); // 表示を更新
        }
    });

    const filterAndRender = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredInventory = inventory.filter(item => {
            const nameMatch = item.name.toLowerCase().includes(searchTerm);
            const locationMatch = item.location.toLowerCase().includes(searchTerm);
            return nameMatch || locationMatch;
        });
        renderTable(filteredInventory);
    };

    searchInput.addEventListener('input', filterAndRender);

    // 初期表示
    renderTable(inventory);
});