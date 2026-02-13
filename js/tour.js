class Tour {
    constructor(steps) {
        this.steps = steps;
        this.currentStep = 0;
        this.isActive = false;

        // Bind methods
        this.next = this.next.bind(this);
        this.prev = this.prev.bind(this);
        this.end = this.end.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.handleKeydown = this.handleKeydown.bind(this);
        this.updatePosition = this.updatePosition.bind(this);
    }

    init() {
        // Create elements if they don't exist
        if (!document.getElementById('tour-backdrop')) {
            const backdrop = document.createElement('div');
            backdrop.id = 'tour-backdrop';
            document.body.appendChild(backdrop);

            const highlight = document.createElement('div');
            highlight.id = 'tour-highlight';
            document.body.appendChild(highlight);

            const tooltip = document.createElement('div');
            tooltip.className = 'tour-tooltip';
            tooltip.innerHTML = `
                <div class="tour-header">
                    <h3 class="tour-title"></h3>
                    <button class="tour-close" aria-label="Close tour">&times;</button>
                </div>
                <div class="tour-body"></div>
                <div class="tour-footer">
                    <span class="tour-progress"></span>
                    <div class="tour-controls">
                        <button class="tour-btn tour-btn-secondary" id="tour-prev">Prev</button>
                        <button class="tour-btn tour-btn-primary" id="tour-next">Next</button>
                    </div>
                </div>
            `;
            document.body.appendChild(tooltip);

            // Add event listeners
            tooltip.querySelector('.tour-close').addEventListener('click', this.end);
            document.getElementById('tour-prev').addEventListener('click', this.prev);
            document.getElementById('tour-next').addEventListener('click', this.next);

            // Close on backdrop click (optional)
             backdrop.addEventListener('click', this.end);
        }
    }

    start() {
        this.init();
        this.isActive = true;
        this.currentStep = 0;
        document.body.classList.add('tour-active');
        document.getElementById('tour-backdrop').classList.add('active');
        document.getElementById('tour-highlight').classList.add('active');
        document.querySelector('.tour-tooltip').classList.add('active');

        window.addEventListener('resize', this.handleResize);
        window.addEventListener('keydown', this.handleKeydown);
        // Update position on scroll to keep tooltip attached if it's fixed?
        // No, tooltip is absolute, so it scrolls with page.

        this.showStep(this.currentStep);
    }

    showStep(index) {
        if (index < 0 || index >= this.steps.length) return;

        this.currentStep = index;
        const step = this.steps[index];
        const target = document.querySelector(step.element);

        if (!target) {
            console.warn(`Tour target not found: ${step.element}`);
            // Try next step if current not found, but prevent infinite loop
            if (index < this.steps.length - 1) {
                this.next();
            } else {
                this.end();
            }
            return;
        }

        // 1. Scroll into view smoothly
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // 2. Update Content
        const tooltip = document.querySelector('.tour-tooltip');
        tooltip.querySelector('.tour-title').innerText = step.title;
        tooltip.querySelector('.tour-body').innerText = step.content;

        // 3. Update Buttons
        const prevBtn = document.getElementById('tour-prev');
        const nextBtn = document.getElementById('tour-next');
        const progress = document.querySelector('.tour-progress');

        prevBtn.disabled = index === 0;
        nextBtn.innerText = index === this.steps.length - 1 ? 'Finish' : 'Next';
        progress.innerText = `${index + 1} / ${this.steps.length}`;

        // 4. Update Position
        // We do this immediately and also after a delay to ensure layout is settled
        this.updatePosition();
        setTimeout(this.updatePosition, 300);
        setTimeout(this.updatePosition, 600);
    }

    updatePosition() {
        if (!this.isActive) return;

        const step = this.steps[this.currentStep];
        const target = document.querySelector(step.element);
        if (!target) return;

        const rect = target.getBoundingClientRect();
        const highlight = document.getElementById('tour-highlight');
        const tooltip = document.querySelector('.tour-tooltip');

        if (!highlight || !tooltip) return;

        const padding = 10;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

        // Update Highlight
        const highlightTop = rect.top + scrollTop - padding;
        const highlightLeft = rect.left + scrollLeft - padding;
        const highlightWidth = rect.width + padding * 2;
        const highlightHeight = rect.height + padding * 2;

        highlight.style.top = `${highlightTop}px`;
        highlight.style.left = `${highlightLeft}px`;
        highlight.style.width = `${highlightWidth}px`;
        highlight.style.height = `${highlightHeight}px`;

        // Update Tooltip
        // Default: Bottom Center
        let tooltipTop = highlightTop + highlightHeight + 15;
        let tooltipLeft = highlightLeft + (highlightWidth / 2) - (tooltip.offsetWidth / 2);

        // Flip to top if not enough space below
        const spaceBelow = document.body.scrollHeight - (highlightTop + highlightHeight);
        // Or better: check against window height to see if it fits in viewport?
        // But we are positioning absolutely on document.

        // Let's use viewport logic for "smart" flip
        const viewportHeight = window.innerHeight;
        const rectBottomRelative = rect.bottom; // relative to viewport

        if (rectBottomRelative + tooltip.offsetHeight + 20 > viewportHeight) {
            // Check if there is space above
            if (rect.top > tooltip.offsetHeight + 20) {
                 tooltipTop = highlightTop - tooltip.offsetHeight - 15;
            }
        }

        // Clamp Left to avoid overflow
        const maxLeft = document.body.clientWidth - tooltip.offsetWidth - 20;
        tooltipLeft = Math.max(20, Math.min(tooltipLeft, maxLeft));

        tooltip.style.top = `${tooltipTop}px`;
        tooltip.style.left = `${tooltipLeft}px`;
    }

    next() {
        if (this.currentStep < this.steps.length - 1) {
            this.showStep(this.currentStep + 1);
        } else {
            this.end();
        }
    }

    prev() {
        if (this.currentStep > 0) {
            this.showStep(this.currentStep - 1);
        }
    }

    end() {
        this.isActive = false;
        document.body.classList.remove('tour-active');

        const backdrop = document.getElementById('tour-backdrop');
        const highlight = document.getElementById('tour-highlight');
        const tooltip = document.querySelector('.tour-tooltip');

        if(backdrop) backdrop.classList.remove('active');
        if(highlight) highlight.classList.remove('active');
        if(tooltip) tooltip.classList.remove('active');

        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('keydown', this.handleKeydown);
    }

    handleResize() {
        this.updatePosition();
    }

    handleKeydown(e) {
        if (!this.isActive) return;
        if (e.key === 'ArrowRight') this.next();
        if (e.key === 'ArrowLeft') this.prev();
        if (e.key === 'Escape') this.end();
    }
}
