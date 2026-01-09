// AI极客俱乐部成员展示平台 - 主JavaScript文件
// 包含筛选功能、卡片生成、详情展示等

document.addEventListener('DOMContentLoaded', function() {
    console.log('AI极客俱乐部平台加载中...');
    
    // 初始化应用程序
    const app = new MemberDirectoryApp();
    app.init();
});

// 主应用程序类
class MemberDirectoryApp {
    constructor() {
        this.members = membersData || [];
        this.filteredMembers = [...this.members];
        this.filters = {
            location: '',
            businessLine: '',
            selectedTags: [],
            search: ''
        };
        
        // 统计信息
        this.stats = {
            totalMembers: this.members.length,
            uniqueLocations: this.getUniqueLocations().length,
            uniqueTags: this.getAllUniqueTags().length
        };
    }
    
    init() {
        console.log(`初始化应用，共 ${this.members.length} 位成员`);
        
        // 渲染初始界面
        this.renderMemberCards();
        this.populateTagFilter();
        this.setupEventListeners();
        this.updateStats();
        this.updateFilterSummary();
        
        // 移除加载状态
        setTimeout(() => {
            const loadingElement = document.querySelector('.loading');
            if (loadingElement) {
                loadingElement.style.display = 'none';
            }
        }, 500);
    }
    
    // 获取所有不重复的工作地点
    getUniqueLocations() {
        const locations = this.members.map(member => member.location);
        return [...new Set(locations)].sort();
    }
    
    // 获取所有不重复的技术标签
    getAllUniqueTags() {
        const allTags = this.members.flatMap(member => member.techTags);
        return [...new Set(allTags)].sort();
    }
    
    // 渲染成员卡片
    renderMemberCards() {
        const grid = document.getElementById('members-grid');
        const noResults = document.getElementById('no-results');
        
        if (!grid) {
            console.error('找不到成员网格容器');
            return;
        }
        
        // 清空现有内容
        grid.innerHTML = '';
        
        if (this.filteredMembers.length === 0) {
            // 显示无结果状态
            grid.style.display = 'none';
            if (noResults) noResults.style.display = 'block';
            return;
        }
        
        // 显示网格
        grid.style.display = 'grid';
        if (noResults) noResults.style.display = 'none';
        
        // 创建并添加卡片
        this.filteredMembers.forEach(member => {
            const card = this.createMemberCard(member);
            grid.appendChild(card);
        });
    }
    
    // 创建单个成员卡片
    createMemberCard(member) {
        const card = document.createElement('div');
        card.className = 'member-card';
        card.dataset.id = member.id;
        
        // 处理长文本，截断显示
        const truncateText = (text, maxLength = 100) => {
            if (!text || text.length <= maxLength) return text;
            return text.substring(0, maxLength) + '...';
        };
        
        const casePreview = truncateText(member.caseStudy);
        const toolsPreview = truncateText(member.tools, 50);
        
        card.innerHTML = `
            <div class="member-header">
                <h3 class="member-name">${member.chineseName}</h3>
                <p class="member-english">${member.englishName}</p>
                <div class="member-info">
                    <span><i class="fas fa-briefcase"></i> ${member.position}</span>
                    <span><i class="fas fa-map-marker-alt"></i> ${member.location}</span>
                </div>
                <div class="member-info">
                    <span><i class="fas fa-building"></i> ${member.department}</span>
                    <span><i class="fas fa-industry"></i> ${member.businessLine}</span>
                </div>
            </div>
            <div class="member-body">
                <div class="member-detail">
                    <span class="detail-label">工号</span>
                    <span class="detail-value">${member.employeeId}</span>
                </div>
                <div class="member-detail">
                    <span class="detail-label">邮箱</span>
                    <span class="detail-value">${member.email}</span>
                </div>
                <div class="member-detail">
                    <span class="detail-label">擅长工具</span>
                    <span class="detail-value">${toolsPreview || '未填写'}</span>
                </div>
                <div class="member-detail">
                    <span class="detail-label">实践案例</span>
                    <span class="detail-value">${casePreview || '暂无案例'}</span>
                </div>
                <div class="member-tags">
                    ${member.techTags.map(tag => 
                        `<span class="member-tag">${tag}</span>`
                    ).join('')}
                </div>
            </div>
        `;
        
        // 添加点击事件
        card.addEventListener('click', () => this.showMemberDetails(member));
        
        return card;
    }
    
    // 填充标签筛选器
    populateTagFilter() {
        const tagContainer = document.getElementById('tag-filter');
        if (!tagContainer) return;
        
        const allTags = this.getAllUniqueTags();
        
        allTags.forEach(tag => {
            const button = document.createElement('button');
            button.className = 'tag-btn';
            button.innerHTML = `<i class="fas fa-tag"></i> ${tag}`;
            button.dataset.tag = tag;
            
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleTagFilter(tag, button);
            });
            
            tagContainer.appendChild(button);
        });
    }
    
    // 切换标签筛选
    toggleTagFilter(tag, button) {
        const index = this.filters.selectedTags.indexOf(tag);
        
        if (index === -1) {
            // 添加标签
            this.filters.selectedTags.push(tag);
            button.classList.add('active');
        } else {
            // 移除标签
            this.filters.selectedTags.splice(index, 1);
            button.classList.remove('active');
        }
        
        this.applyFilters();
    }
    
    // 设置事件监听器
    setupEventListeners() {
        // 工作地点筛选
        const locationFilter = document.getElementById('location-filter');
        if (locationFilter) {
            locationFilter.addEventListener('change', (e) => {
                this.filters.location = e.target.value;
                this.applyFilters();
            });
        }
        
        // 业务线筛选
        const businessFilter = document.getElementById('business-filter');
        if (businessFilter) {
            businessFilter.addEventListener('change', (e) => {
                this.filters.businessLine = e.target.value;
                this.applyFilters();
            });
        }
        
        // 搜索框
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filters.search = e.target.value.trim().toLowerCase();
                this.applyFilters();
            });
        }
        
        // 重置按钮
        const resetBtn = document.getElementById('reset-filters');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetFilters();
            });
        }
        
        // 清除所有筛选按钮
        const clearAllBtn = document.getElementById('clear-all-filters');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', () => {
                this.resetFilters();
            });
        }
        
        // 模态框关闭按钮
        const closeModal = document.querySelector('.close-modal');
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                this.closeMemberModal();
            });
        }
        
        // 点击模态框外部关闭
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('member-modal');
            if (e.target === modal) {
                this.closeMemberModal();
            }
        });
        
        // 按ESC键关闭模态框
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeMemberModal();
            }
        });
    }
    
    // 应用筛选
    applyFilters() {
        console.log('应用筛选条件:', this.filters);
        
        this.filteredMembers = this.members.filter(member => {
            // 工作地点筛选
            if (this.filters.location && member.location !== this.filters.location) {
                return false;
            }
            
            // 业务线筛选
            if (this.filters.businessLine && member.businessLine !== this.filters.businessLine) {
                return false;
            }
            
            // 技术标签筛选（多选）
            if (this.filters.selectedTags.length > 0) {
                const memberTags = member.techTags || [];
                const hasSelectedTag = this.filters.selectedTags.some(tag => 
                    memberTags.includes(tag)
                );
                if (!hasSelectedTag) return false;
            }
            
            // 搜索框筛选
            if (this.filters.search) {
                const searchLower = this.filters.search.toLowerCase();
                const searchFields = [
                    member.chineseName,
                    member.englishName,
                    member.position,
                    member.department,
                    member.businessLine,
                    member.location,
                    member.tools,
                    member.interests,
                    member.projectIdeas
                ].join(' ').toLowerCase();
                
                if (!searchFields.includes(searchLower)) {
                    return false;
                }
            }
            
            return true;
        });
        
        // 更新界面
        this.renderMemberCards();
        this.updateStats();
        this.updateFilterSummary();
    }
    
    // 重置所有筛选
    resetFilters() {
        console.log('重置所有筛选');
        
        // 重置筛选对象
        this.filters = {
            location: '',
            businessLine: '',
            selectedTags: [],
            search: ''
        };
        
        // 重置UI元素
        const locationFilter = document.getElementById('location-filter');
        const businessFilter = document.getElementById('business-filter');
        const searchInput = document.getElementById('search-input');
        
        if (locationFilter) locationFilter.value = '';
        if (businessFilter) businessFilter.value = '';
        if (searchInput) searchInput.value = '';
        
        // 重置标签按钮
        const tagButtons = document.querySelectorAll('.tag-btn');
        tagButtons.forEach(btn => btn.classList.remove('active'));
        
        // 重置筛选成员列表
        this.filteredMembers = [...this.members];
        
        // 更新界面
        this.renderMemberCards();
        this.updateStats();
        this.updateFilterSummary();
    }
    
    // 更新统计信息
    updateStats() {
        // 总成员数
        const totalEl = document.getElementById('total-members');
        if (totalEl) totalEl.textContent = this.stats.totalMembers;
        
        // 当前显示成员数
        const filteredEl = document.getElementById('filtered-members');
        if (filteredEl) filteredEl.textContent = this.filteredMembers.length;
        
        // 工作地点数量
        const locationEl = document.getElementById('location-count');
        if (locationEl) locationEl.textContent = this.stats.uniqueLocations;
        
        // 技术标签数量
        const tagEl = document.getElementById('tag-count');
        if (tagEl) tagEl.textContent = this.stats.uniqueTags;
        
        // 页脚成员数
        const footerEl = document.getElementById('footer-count');
        if (footerEl) footerEl.textContent = this.stats.totalMembers;
    }
    
    // 更新筛选摘要
    updateFilterSummary() {
        const summaryEl = document.getElementById('filter-summary');
        if (!summaryEl) return;
        
        const activeFilters = [];
        
        if (this.filters.location) {
            activeFilters.push(`地点：${this.filters.location}`);
        }
        
        if (this.filters.businessLine) {
            activeFilters.push(`业务线：${this.filters.businessLine}`);
        }
        
        if (this.filters.selectedTags.length > 0) {
            activeFilters.push(`标签：${this.filters.selectedTags.join(', ')}`);
        }
        
        if (this.filters.search) {
            activeFilters.push(`搜索："${this.filters.search}"`);
        }
        
        if (activeFilters.length === 0) {
            summaryEl.textContent = '全部成员';
        } else {
            summaryEl.textContent = activeFilters.join(' | ');
        }
    }
    
    // 显示成员详情模态框
    showMemberDetails(member) {
        console.log('显示成员详情:', member.chineseName);
        
        const modal = document.getElementById('member-modal');
        const modalBody = document.getElementById('modal-body');
        
        if (!modal || !modalBody) return;
        
        // 生成模态框内容
        modalBody.innerHTML = this.createModalContent(member);
        
        // 显示模态框
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // 防止背景滚动
    }
    
    // 创建模态框内容
    createModalContent(member) {
        // 格式化长文本，保留换行
        const formatText = (text) => {
            if (!text) return '未填写';
            return text.replace(/\n/g, '<br>');
        };
        
        return `
            <div class="modal-header">
                <h2 class="modal-name">${member.chineseName}</h2>
                <p class="modal-english">${member.englishName}</p>
                <div class="modal-info-grid">
                    <div class="modal-info-item">
                        <span class="modal-info-label">工号</span>
                        <span class="modal-info-value">${member.employeeId}</span>
                    </div>
                    <div class="modal-info-item">
                        <span class="modal-info-label">职位</span>
                        <span class="modal-info-value">${member.position}</span>
                    </div>
                    <div class="modal-info-item">
                        <span class="modal-info-label">部门</span>
                        <span class="modal-info-value">${member.department}</span>
                    </div>
                    <div class="modal-info-item">
                        <span class="modal-info-label">科组</span>
                        <span class="modal-info-value">${member.group || '未填写'}</span>
                    </div>
                    <div class="modal-info-item">
                        <span class="modal-info-label">业务线</span>
                        <span class="modal-info-value">${member.businessLine}</span>
                    </div>
                    <div class="modal-info-item">
                        <span class="modal-info-label">工作地点</span>
                        <span class="modal-info-value">${member.location}</span>
                    </div>
                    <div class="modal-info-item">
                        <span class="modal-info-label">邮箱</span>
                        <span class="modal-info-value">${member.email}</span>
                    </div>
                    <div class="modal-info-item">
                        <span class="modal-info-label">电话</span>
                        <span class="modal-info-value">${member.phone || '未提供'}</span>
                    </div>
                </div>
            </div>
            <div class="modal-body-content">
                <div class="modal-section">
                    <h3 class="modal-section-title"><i class="fas fa-tools"></i> 擅长工具</h3>
                    <div class="modal-section-content">${formatText(member.tools)}</div>
                </div>
                
                <div class="modal-section">
                    <h3 class="modal-section-title"><i class="fas fa-chart-line"></i> AI/自动化实践案例</h3>
                    <div class="modal-section-content">${formatText(member.caseStudy)}</div>
                </div>
                
                <div class="modal-section">
                    <h3 class="modal-section-title"><i class="fas fa-heart"></i> 兴趣方向</h3>
                    <div class="modal-section-content">${formatText(member.interests)}</div>
                </div>
                
                <div class="modal-section">
                    <h3 class="modal-section-title"><i class="fas fa-lightbulb"></i> 创意项目想法</h3>
                    <div class="modal-section-content">${formatText(member.projectIdeas)}</div>
                </div>
                
                <div class="modal-section">
                    <h3 class="modal-section-title"><i class="fas fa-bullseye"></i> 期望收获</h3>
                    <div class="modal-section-content">${formatText(member.expectations)}</div>
                </div>
                
                ${member.notes && member.notes !== '/' && member.notes !== '无' ? `
                <div class="modal-section">
                    <h3 class="modal-section-title"><i class="fas fa-sticky-note"></i> 其他备注</h3>
                    <div class="modal-section-content">${formatText(member.notes)}</div>
                </div>
                ` : ''}
                
                <div class="modal-section">
                    <h3 class="modal-section-title"><i class="fas fa-tags"></i> 技术标签</h3>
                    <div class="modal-tags">
                        ${member.techTags.map(tag => 
                            `<span class="modal-tag">${tag}</span>`
                        ).join('')}
                    </div>
                </div>
            </div>
        `;
    }
    
    // 关闭成员详情模态框
    closeMemberModal() {
        const modal = document.getElementById('member-modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto'; // 恢复滚动
        }
    }
}

// 确保在页面加载完成后执行
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('AI极客俱乐部平台已加载完成！');
    });
} else {
    console.log('AI极客俱乐部平台已就绪！');
}
