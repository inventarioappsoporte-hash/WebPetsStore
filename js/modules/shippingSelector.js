/**
 * 🚚 Módulo ShippingSelector - Selector de Zona de Envío
 * Carga configuración de envío y permite seleccionar zona en el carrito
 */

class ShippingSelector {
    static config = null;
    static selectedZone = null;
    static listeners = [];

    /**
     * Inicializar el módulo de envío
     */
    static async init() {
        await this.loadConfig();
        this.loadSelectedZone();
    }

    /**
     * Cargar configuración de envío desde JSON
     */
    static async loadConfig() {
        try {
            const response = await fetch('data/shipping.json');
            if (!response.ok) {
                console.warn('shipping.json no encontrado, envío deshabilitado');
                this.config = { enabled: false, zones: [] };
                return;
            }
            this.config = await response.json();
        } catch (error) {
            console.error('Error cargando shipping.json:', error);
            this.config = { enabled: false, zones: [] };
        }
    }

    /**
     * Verificar si el sistema de envío está habilitado
     */
    static isEnabled() {
        return this.config?.enabled === true;
    }

    /**
     * Obtener todas las zonas activas
     */
    static getActiveZones() {
        if (!this.config?.zones) return [];
        return this.config.zones
            .filter(z => z.active)
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    }

    /**
     * Obtener zona por ID
     */
    static getZone(zoneId) {
        return this.config?.zones?.find(z => z.id === zoneId);
    }

    /**
     * Obtener zona destacada (para mostrar en producto)
     */
    static getHighlightedZone() {
        if (!this.config?.highlightedZone) return null;
        return this.getZone(this.config.highlightedZone);
    }

    /**
     * Obtener zona por defecto
     */
    static getDefaultZone() {
        if (this.config?.defaultZone) {
            return this.getZone(this.config.defaultZone);
        }
        const zones = this.getActiveZones();
        return zones.length > 0 ? zones[0] : null;
    }

    /**
     * Seleccionar zona de envío
     */
    static selectZone(zoneId) {
        const zone = this.getZone(zoneId);
        if (!zone) return false;

        this.selectedZone = zone;
        this.saveSelectedZone();
        this.notifyListeners();
        return true;
    }

    /**
     * Obtener zona seleccionada actualmente
     */
    static getSelectedZone() {
        if (!this.selectedZone) {
            this.selectedZone = this.getDefaultZone();
        }
        return this.selectedZone;
    }

    /**
     * Calcular costo de envío para un subtotal dado
     */
    static calculateShipping(subtotal, zone = null) {
        const selectedZone = zone || this.getSelectedZone();
        if (!selectedZone) return { cost: 0, isFree: false, message: '' };

        // Verificar envío gratis por monto mínimo
        if (selectedZone.freeShipping?.enabled && subtotal >= selectedZone.freeShipping.minAmount) {
            return {
                cost: 0,
                isFree: true,
                message: '¡Envío GRATIS!',
                zone: selectedZone
            };
        }

        // Según tipo de envío
        switch (selectedZone.type) {
            case 'fixed':
                return {
                    cost: selectedZone.price || 0,
                    isFree: false,
                    message: `Envío a ${selectedZone.name}`,
                    zone: selectedZone
                };
            case 'cargo':
                return {
                    cost: 0,
                    isFree: false,
                    isCargo: true,
                    message: selectedZone.cargoMessage || 'Pago en destino',
                    zone: selectedZone
                };
            case 'free':
                return {
                    cost: 0,
                    isFree: true,
                    message: selectedZone.pickupAddress || 'Retiro en tienda',
                    zone: selectedZone
                };
            default:
                return { cost: 0, isFree: false, message: '', zone: selectedZone };
        }
    }

    /**
     * Obtener mensaje de "cuánto falta para envío gratis"
     */
    static getFreeShippingMessage(subtotal, zone = null) {
        const selectedZone = zone || this.getSelectedZone();
        if (!selectedZone?.freeShipping?.enabled) return null;

        const minAmount = selectedZone.freeShipping.minAmount;
        if (subtotal >= minAmount) return null;

        const falta = minAmount - subtotal;
        return `¡Agregá ${this.formatPrice(falta)} más y el envío es GRATIS!`;
    }

    /**
     * Guardar zona seleccionada en localStorage
     */
    static saveSelectedZone() {
        if (this.selectedZone) {
            localStorage.setItem('pets-store-shipping-zone', this.selectedZone.id);
        }
    }

    /**
     * Cargar zona seleccionada desde localStorage
     */
    static loadSelectedZone() {
        const savedZoneId = localStorage.getItem('pets-store-shipping-zone');
        if (savedZoneId) {
            const zone = this.getZone(savedZoneId);
            if (zone && zone.active) {
                this.selectedZone = zone;
                return;
            }
        }
        this.selectedZone = this.getDefaultZone();
    }

    /**
     * Registrar listener para cambios de zona
     */
    static addListener(callback) {
        this.listeners.push(callback);
    }

    /**
     * Notificar a listeners
     */
    static notifyListeners() {
        this.listeners.forEach(callback => {
            try {
                callback(this.selectedZone);
            } catch (error) {
                console.error('Error in shipping listener:', error);
            }
        });
    }

    /**
     * Formatear precio
     */
    static formatPrice(price) {
        return '$' + (price || 0).toLocaleString('es-AR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    }

    /**
     * Renderizar información de envío para página de producto
     */
    static renderProductShipping() {
        if (!this.isEnabled()) return '';

        const zone = this.getHighlightedZone();
        if (!zone) return '';

        let html = '<div class="product-shipping-info">';
        html += '<h4>🚚 Envío</h4>';

        switch (zone.type) {
            case 'fixed':
                html += `<p>📦 Envío a ${zone.name}: <strong>${this.formatPrice(zone.price)}</strong></p>`;
                break;
            case 'cargo':
                html += `<p>📦 Envío a ${zone.name}: <em>Pago en destino</em></p>`;
                break;
            case 'free':
                html += `<p>🏪 Retiro en tienda: <strong>GRATIS</strong></p>`;
                break;
        }

        if (zone.days) {
            html += `<p class="shipping-days">Entrega en ${zone.days} días</p>`;
        }

        if (zone.freeShipping?.enabled) {
            html += `<p class="shipping-free-promo">🎁 ${zone.freeShipping.message}</p>`;
        }

        html += '</div>';
        return html;
    }

    /**
     * Renderizar selector de zona para el carrito
     */
    static renderCartSelector(subtotal) {
        if (!this.isEnabled()) return '';

        const zones = this.getActiveZones();
        if (zones.length === 0) return '';

        const selectedZone = this.getSelectedZone();
        const shipping = this.calculateShipping(subtotal);
        const freeMessage = this.getFreeShippingMessage(subtotal);

        let html = '<div class="cart-shipping-selector">';
        html += '<label for="shipping-zone">🚚 Zona de envío:</label>';
        html += '<select id="shipping-zone" onchange="ShippingSelector.selectZone(this.value)">';

        zones.forEach(zone => {
            let label = zone.name;
            if (zone.type === 'fixed') {
                // Verificar si aplica envío gratis
                if (zone.freeShipping?.enabled && subtotal >= zone.freeShipping.minAmount) {
                    label += ' - GRATIS';
                } else {
                    label += ` - ${this.formatPrice(zone.price)}`;
                }
            } else if (zone.type === 'cargo') {
                label += ' - Pago en destino';
            } else if (zone.type === 'free') {
                label += ' - GRATIS';
            }

            const selected = selectedZone?.id === zone.id ? 'selected' : '';
            html += `<option value="${zone.id}" ${selected}>${label}</option>`;
        });

        html += '</select>';

        // Mostrar costo de envío
        html += '<div class="cart-shipping-cost">';
        if (shipping.isCargo) {
            html += `<span class="shipping-cargo">📦 ${shipping.message}</span>`;
        } else if (shipping.isFree) {
            html += `<span class="shipping-free">✅ ${shipping.message}</span>`;
        } else {
            html += `<span>Costo de envío: <strong>${this.formatPrice(shipping.cost)}</strong></span>`;
        }
        html += '</div>';

        // Mensaje de envío gratis
        if (freeMessage) {
            html += `<div class="cart-shipping-promo">🎁 ${freeMessage}</div>`;
        }

        html += '</div>';
        return html;
    }
}

// Inicializar cuando el DOM esté listo
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => ShippingSelector.init());
    } else {
        ShippingSelector.init();
    }
}
