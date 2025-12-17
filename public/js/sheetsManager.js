export class SheetsManager {
    constructor() {
        this.sheets = [
            { name: 'Addresses', link: 'https://docs.google.com/spreadsheets/d/171aYo2Aa4IBFGIPx5j8ctn0FNoX8w_3JYs-or8av1sc/edit?gid=1659736968#gid=1659736968' },
            { name: 'Farm 1', link: 'https://docs.google.com/spreadsheets/d/171aYo2Aa4IBFGIPx5j8ctn0FNoX8w_3JYs-or8av1sc/edit?gid=0#gid=0' },
            { name: 'Farm 2', link: 'https://docs.google.com/spreadsheets/d/171aYo2Aa4IBFGIPx5j8ctn0FNoX8w_3JYs-or8av1sc/edit?gid=1589663508#gid=1589663508' },
            { name: 'Pool', link: 'https://docs.google.com/spreadsheets/d/171aYo2Aa4IBFGIPx5j8ctn0FNoX8w_3JYs-or8av1sc/edit?gid=1638753622#gid=1638753622' },
            { name: 'Strategy 1', link: 'https://docs.google.com/spreadsheets/d/171aYo2Aa4IBFGIPx5j8ctn0FNoX8w_3JYs-or8av1sc/edit?gid=1013482576#gid=1013482576' },
            { name: 'Strategy 2', link: 'https://docs.google.com/spreadsheets/d/171aYo2Aa4IBFGIPx5j8ctn0FNoX8w_3JYs-or8av1sc/edit?gid=1797497299#gid=1797497299' },
            { name: 'Strategy 3', link: 'https://docs.google.com/spreadsheets/d/171aYo2Aa4IBFGIPx5j8ctn0FNoX8w_3JYs-or8av1sc/edit?gid=1461100973#gid=1461100973' },
            { name: 'Strategy 4', link: 'https://docs.google.com/spreadsheets/d/171aYo2Aa4IBFGIPx5j8ctn0FNoX8w_3JYs-or8av1sc/edit?gid=34076036#gid=34076036' },
            { name: 'Strategy 5', link: 'https://docs.google.com/spreadsheets/d/171aYo2Aa4IBFGIPx5j8ctn0FNoX8w_3JYs-or8av1sc/edit?gid=1596041210#gid=1596041210' },
            { name: 'Strategy 6', link: 'https://docs.google.com/spreadsheets/d/171aYo2Aa4IBFGIPx5j8ctn0FNoX8w_3JYs-or8av1sc/edit?gid=1082220594#gid=1082220594' },
            { name: 'Identifying Taiwan Fee Address', link: 'https://docs.google.com/spreadsheets/d/171aYo2Aa4IBFGIPx5j8ctn0FNoX8w_3JYs-or8av1sc/edit?gid=166299436#gid=166299436' },
            { name: 'Report per strategy Farm 1', link: 'https://docs.google.com/spreadsheets/d/171aYo2Aa4IBFGIPx5j8ctn0FNoX8w_3JYs-or8av1sc/edit?gid=1096521461#gid=1096521461' },
            { name: 'Report per strategy Farm 2', link: 'https://docs.google.com/spreadsheets/d/171aYo2Aa4IBFGIPx5j8ctn0FNoX8w_3JYs-or8av1sc/edit?gid=1921196443#gid=1921196443' },
            { name: 'Gas Cost per Strategy', link: 'https://docs.google.com/spreadsheets/d/171aYo2Aa4IBFGIPx5j8ctn0FNoX8w_3JYs-or8av1sc/edit?gid=692560811#gid=692560811' },
            { name: 'Taiwan fee', link: 'https://docs.google.com/spreadsheets/d/171aYo2Aa4IBFGIPx5j8ctn0FNoX8w_3JYs-or8av1sc/edit?gid=1559191402#gid=1559191402' },
        ];
        this.sheetsContainer = document.getElementById('sheets-list-container');
    }

    init() {
        this.renderSheets();
    }

    renderSheets() {
        this.sheetsContainer.innerHTML = '';

        this.sheets.forEach((sheet, idx) => {
            const card = document.createElement('div');
            card.className = 'bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow';
            
            const linkButton = sheet.link 
                ? `<a href="${sheet.link}" target="_blank" class="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors text-center">
                    Open Sheet
                  </a>`
                : `<button class="flex-1 bg-gray-300 text-gray-500 px-3 py-2 rounded text-sm font-medium cursor-not-allowed" disabled>
                    Link not set
                  </button>`;

            card.innerHTML = `
                <div class="flex items-start justify-between mb-3">
                    <div class="flex items-center gap-2 flex-1">
                        <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-semibold text-gray-800">${sheet.name}</p>
                        </div>
                    </div>
                </div>
                <div class="flex gap-2">
                    ${linkButton}
                </div>
            `;
            this.sheetsContainer.appendChild(card);
        });
    }

    updateSheetLink(sheetName, link) {
        const sheet = this.sheets.find(s => s.name === sheetName);
        if (sheet) {
            sheet.link = link;
            this.renderSheets();
        }
    }

    addSheet(name) {
        this.sheets.push({ name, link: '' });
        this.renderSheets();
    }

    removeSheet(name) {
        this.sheets = this.sheets.filter(s => s.name !== name);
        this.renderSheets();
    }

    getAllSheets() {
        return this.sheets;
    }
}

