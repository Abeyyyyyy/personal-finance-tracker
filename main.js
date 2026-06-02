// ==========================================
// 1. MENGAMBIL ELEMEN HTML (DOM Selection)
// ==========================================
const greetingElement = document.querySelector('.tracker-header__greeting');
const incomeList = document.getElementById('incomeList');
const expenseList = document.getElementById('expenseList');
const transactionForm = document.getElementById('transactionForm');
const searchInput = document.getElementById('searchInput'); 
const submitBtn = document.getElementById('submitBtn');

const balanceElement = document.getElementById('balance');
const incomeTotalElement = document.getElementById('incomeTotal');
const expenseTotalElement = document.getElementById('expenseTotal');

// ==========================================
// 2. STATE (DATA) APLIKASI
// ==========================================
const STORAGE_KEY = 'PERSONAL_FINANCE_DATA';
let transactions = []; 
let editId = null;     // Penanda apakah kita sedang mode Edit atau Tambah
const UPDATE_UI_EVENT = 'update-ui-event'; 

// ==========================================
// 3. FUNGSI DASAR (STORAGE & GREETING)
// ==========================================
function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    if (serializedData) {
        transactions = JSON.parse(serializedData);
    }
}

function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

function updateGreeting() {
    greetingElement.textContent = 'Abiyya Hamdan N (SMKN 4 BANDUNG)';
}

// ==========================================
// 4. RENDER UI (MENAMPILKAN DATA KE LAYAR)
// ==========================================
function renderTransactions() {
    incomeList.innerHTML = '';
    expenseList.innerHTML = '';

    const searchTerm = searchInput.value.toLowerCase();

    transactions.forEach(transaction => {
        // Logika Filter Pencarian (Advanced)
        if (searchTerm && !transaction.title.toLowerCase().includes(searchTerm)) {
            return; 
        }

        const itemDiv = document.createElement('div');
        itemDiv.setAttribute('data-testid', 'transactionItem');
        itemDiv.dataset.id = transaction.id; 

        const titleH3 = document.createElement('h3');
        titleH3.setAttribute('data-testid', 'transactionItemTitle');
        titleH3.textContent = transaction.title;

        const amountP = document.createElement('p');
        amountP.setAttribute('data-testid', 'transactionItemAmount');
        amountP.textContent = `Nominal: Rp${transaction.amount.toLocaleString('id-ID')}`;

        const dateP = document.createElement('p');
        dateP.setAttribute('data-testid', 'transactionItemDate');
        dateP.textContent = `Tanggal: ${transaction.date}`;

        const typeP = document.createElement('p');
        typeP.setAttribute('data-testid', 'transactionItemType');
        typeP.textContent = `Tipe: ${transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}`;

        const actionDiv = document.createElement('div');
        
        // 1. Tombol Edit (Tambahan untuk syarat Kriteria 2 Skilled)
        const editBtn = document.createElement('button');
        editBtn.setAttribute('data-testid', 'transactionItemEditButton');
        editBtn.textContent = 'Edit';
        editBtn.style.backgroundColor = '#3b82f6'; // Warna Biru
        editBtn.style.color = 'white';
        editBtn.addEventListener('click', () => handleEdit(transaction.id));

        // 2. Tombol Ubah Tipe
        const editTypeBtn = document.createElement('button');
        editTypeBtn.setAttribute('data-testid', 'transactionItemEditTypeButton');
        editTypeBtn.textContent = 'Ubah Tipe';
        editTypeBtn.addEventListener('click', () => handleEditType(transaction.id));

        // 3. Tombol Hapus
        const deleteBtn = document.createElement('button');
        deleteBtn.setAttribute('data-testid', 'transactionItemDeleteButton');
        deleteBtn.textContent = 'Hapus';
        deleteBtn.addEventListener('click', () => handleDelete(transaction.id));

        actionDiv.appendChild(editBtn);
        actionDiv.appendChild(editTypeBtn);
        actionDiv.appendChild(deleteBtn);

        itemDiv.appendChild(titleH3);
        itemDiv.appendChild(amountP);
        itemDiv.appendChild(dateP);
        itemDiv.appendChild(typeP);
        itemDiv.appendChild(actionDiv);

        if (transaction.type === 'income') {
            incomeList.appendChild(itemDiv);
        } else {
            expenseList.appendChild(itemDiv);
        }
    });
}

function updateDashboard() {
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(t => {
        if (t.type === 'income') totalIncome += t.amount;
        else totalExpense += t.amount;
    });

    const balance = totalIncome - totalExpense;

    balanceElement.textContent = `Rp${balance.toLocaleString('id-ID')}`;
    incomeTotalElement.textContent = `Rp${totalIncome.toLocaleString('id-ID')}`;
    expenseTotalElement.textContent = `Rp${totalExpense.toLocaleString('id-ID')}`;
}

// ==========================================
// 5. CUSTOM EVENT (SYARAT BINTANG 5)
// ==========================================
document.addEventListener(UPDATE_UI_EVENT, () => {
    renderTransactions();
    updateDashboard();
});

function triggerUIUpdate() {
    document.dispatchEvent(new CustomEvent(UPDATE_UI_EVENT));
}

// ==========================================
// 6. LOGIKA FORM (SUBMIT: TAMBAH & UPDATE)
// ==========================================
function handleFormSubmit(event) {
    event.preventDefault(); 

    const title = document.getElementById('title').value.trim();
    const amount = parseFloat(document.getElementById('amount').value);
    const date = document.getElementById('date').value;
    const type = document.getElementById('type').value;

    if (title === "") {
        alert("Judul transaksi tidak boleh kosong!");
        return; 
    }
    if (isNaN(amount) || amount < 1) {
        alert("Nominal uang harus lebih dari Rp 1!");
        return;
    }

    // Cek apakah sedang dalam mode EDIT atau TAMBAH
    if (editId !== null) {
        // MODE UPDATE
        const index = transactions.findIndex(t => t.id === editId);
        if (index !== -1) {
            transactions[index] = {
                ...transactions[index],
                title, amount, date, type
            };
        }
        editId = null; // Reset mode edit
        submitBtn.textContent = 'Simpan Transaksi'; // Kembalikan teks tombol
    } else {
        // MODE TAMBAH
        const newTransaction = {
            id: +new Date(), 
            title, amount, date, type
        };
        transactions.push(newTransaction);
    }

    saveData();
    transactionForm.reset();
    triggerUIUpdate(); 
}

// ==========================================
// 7. FITUR INTERAKTIF (HAPUS, UBAH TIPE, EDIT)
// ==========================================
function handleDelete(id) {
    if (confirm("Yakin ingin menghapus transaksi ini?")) {
        transactions = transactions.filter(t => t.id !== id);
        saveData();
        triggerUIUpdate();
    }
}

function handleEditType(id) {
    const index = transactions.findIndex(t => t.id === id);
    if (index !== -1) {
        // Toggle antara income dan expense
        transactions[index].type = transactions[index].type === 'income' ? 'expense' : 'income';
        saveData();
        triggerUIUpdate();
    }
}

function handleEdit(id) {
    const transaction = transactions.find(t => t.id === id);
    if (transaction) {
        // Isi form dengan data yang dipilih
        document.getElementById('title').value = transaction.title;
        document.getElementById('amount').value = transaction.amount;
        document.getElementById('date').value = transaction.date;
        document.getElementById('type').value = transaction.type;
        
        // Aktifkan mode Edit
        editId = id; 
        submitBtn.textContent = 'Update Transaksi'; // Ubah teks tombol
        
        // Scroll ke form agar user sadar formnya terisi
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// ==========================================
// 8. INISIALISASI APLIKASI
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    loadDataFromStorage();
    updateGreeting();
    
    // Event Listener Form
    transactionForm.addEventListener('submit', handleFormSubmit);
    
    // Event Listener Pencarian (Real-time)
    searchInput.addEventListener('input', triggerUIUpdate);
    
    // Render awal
    triggerUIUpdate(); 
});