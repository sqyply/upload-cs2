const UI = {
    showPage(page) {
        document.getElementById('page-main').classList.toggle('hidden', page !== 'main');
        document.getElementById('page-profile').classList.toggle('hidden', page !== 'profile');
    },

    renderSkins(containerId, skins, type, selected) {
        const div = document.getElementById(containerId);
        div.innerHTML = skins.map(s => `
            <div onclick="window.handleSelect('${s.name}', '${type}')" 
                 class="skin-card p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3 cursor-pointer transition-all ${selected?.name === s.name ? 'selected' : ''}">
                <img src="${s.img}" class="w-10 h-10 object-contain">
                <div>
                    <div class="text-[9px] font-black text-gray-400 uppercase">${s.name}</div>
                    <div class="text-yellow-500 font-black text-xs italic">${s.price.toLocaleString()} SQ</div>
                </div>
            </div>
        `).join('');
    },

    updateCircle(chance) {
        const ring = document.getElementById('progress-ring');
        const dash = 942 - (942 * chance / 100);
        ring.style.strokeDashoffset = dash;
        document.getElementById('chance-display').innerText = chance.toFixed(1) + '%';
    }
};

window.showPage = UI.showPage;
