/**
 * live-search.js
 * End-to-end Live Search Implementation (v1.2-STABLE)
 * 
 * FIX: Dropdown is appended to document.body and positioned with
 * fixed coordinates to escape all CSS stacking contexts created by
 * backdrop-filter on parent containers.
 */
(function() {
    'use strict';

    const DEBOUNCE_DELAY = 300;
    const CONTEXT_PATH = window.CONTEXT_PATH || "";

    class LiveSearch {
        constructor(input) {
            this.input = input;
            this.form = input.closest('form');
            this.dropdown = null;
            this.abortController = null;
            this.debounceTimer = null;
            this.selectedIndex = -1;
            this.results = [];

            this.init();
        }

        init() {
            // Create dropdown element — appended to BODY to escape stacking contexts
            this.dropdown = document.createElement('div');
            this.dropdown.className = 'live-search-dropdown hidden';
            document.body.appendChild(this.dropdown);

            // Event Listeners
            this.input.addEventListener('input', () => this.handleInput());
            this.input.addEventListener('keydown', (e) => this.handleKeydown(e));
            this.input.setAttribute('autocomplete', 'off');

            // Reposition on scroll/resize
            window.addEventListener('scroll', () => { if (!this.dropdown.classList.contains('hidden')) this.positionDropdown(); }, true);
            window.addEventListener('resize', () => { if (!this.dropdown.classList.contains('hidden')) this.positionDropdown(); });

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (e.target !== this.input && !this.dropdown.contains(e.target)) {
                    this.close();
                }
            });

            // Re-open on focus if query present
            this.input.addEventListener('focus', () => {
                if (this.input.value.trim().length >= 2) {
                    this.handleInput();
                }
            });
        }

        /** Position the dropdown directly below the input using fixed coords */
        positionDropdown() {
            const rect = this.input.getBoundingClientRect();
            this.dropdown.style.top = (rect.bottom + 6) + 'px';
            this.dropdown.style.left = rect.left + 'px';
            this.dropdown.style.width = rect.width + 'px';
        }

        handleInput() {
            const query = this.input.value.trim();

            clearTimeout(this.debounceTimer);
            if (this.abortController) this.abortController.abort();

            if (query.length < 2) {
                this.close();
                return;
            }

            this.debounceTimer = setTimeout(() => this.fetchResults(query), DEBOUNCE_DELAY);
        }

        async fetchResults(query) {
            this.abortController = new AbortController();

            try {
                // Show loading state
                this.positionDropdown();
                this.dropdown.classList.remove('hidden');
                this.dropdown.innerHTML = '<div class="live-search-loading">Searching\u2026</div>';

                const response = await fetch(CONTEXT_PATH + '/live-search?q=' + encodeURIComponent(query), {
                    signal: this.abortController.signal
                });

                if (!response.ok) throw new Error('Network response was not ok');

                const data = await response.json();
                this.results = data.results || [];
                this.renderResults();
            } catch (error) {
                if (error.name === 'AbortError') return;
                console.error('Live search fetch error:', error);
                this.close();
            }
        }

        renderResults() {
            if (this.results.length === 0) {
                this.dropdown.innerHTML = '<div class="live-search-no-results">No songs found</div>';
                this.selectedIndex = -1;
                return;
            }

            const html = this.results.map((song, index) =>
                '<div class="live-search-item" data-index="' + index + '" data-id="' + song.id + '">' +
                    '<span class="live-search-number">#' + song.songNumber + '</span>' +
                    '<span class="live-search-title">' + this.escapeHtml(song.title) + '</span>' +
                '</div>'
            ).join('');

            this.dropdown.innerHTML = html;
            this.positionDropdown();
            this.dropdown.classList.remove('hidden');
            this.selectedIndex = -1;

            // Click events for items
            this.dropdown.querySelectorAll('.live-search-item').forEach(item => {
                item.addEventListener('click', () => {
                    this.selectItem(parseInt(item.dataset.index));
                });
            });
        }

        handleKeydown(e) {
            if (this.dropdown.classList.contains('hidden')) return;

            const items = this.dropdown.querySelectorAll('.live-search-item');

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.selectedIndex = Math.min(this.selectedIndex + 1, items.length - 1);
                this.updateSelection(items);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
                this.updateSelection(items);
            } else if (e.key === 'Enter') {
                if (this.selectedIndex >= 0) {
                    e.preventDefault();
                    this.selectItem(this.selectedIndex);
                }
            } else if (e.key === 'Escape') {
                this.close();
            }
        }

        updateSelection(items) {
            items.forEach((item, index) => {
                item.classList.toggle('active', index === this.selectedIndex);
            });
            if (this.selectedIndex >= 0) {
                items[this.selectedIndex].scrollIntoView({ block: 'nearest' });
            }
        }

        selectItem(index) {
            const song = this.results[index];
            if (song) {
                window.location.href = CONTEXT_PATH + '/song?id=' + song.id;
            }
        }

        close() {
            if (this.dropdown) this.dropdown.classList.add('hidden');
            this.selectedIndex = -1;
        }

        escapeHtml(str) {
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        }
    }

    // Initialize all search inputs
    document.addEventListener('DOMContentLoaded', () => {
        const searchInputs = document.querySelectorAll('input[name="q"]');
        searchInputs.forEach(input => new LiveSearch(input));
    });

})();
