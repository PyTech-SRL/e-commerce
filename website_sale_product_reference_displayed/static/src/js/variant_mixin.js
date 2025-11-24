odoo.define("website_sale_product_reference_displayed.variant_mixin", function (
    require
) {
    "use strict";

    var publicWidget = require("web.public.widget");

    publicWidget.registry.WebsiteSale.include({
        events: _.defaults(
            {
                "change .js_variant_reference_displayed": "onChangeVariant",
            },
            publicWidget.registry.WebsiteSale.prototype.events
        ),

        /**
         * Set attribute values of the product according to `combination_dict`.
         *
         * @param {$.Element} $container the container to look into
         * @param {dict} combination_dict combination to be applied
         */
        _setReferenceDisplayedCombination: function ($container, combination_dict) {
            // Same selectors as getSelectedVariantValues
            var variantsValuesSelectors = [
                "input.js_variant_change",
                "select.js_variant_change",
            ];
            $container.find(".variant_attribute").each(function () {
                var $attribute_el = $(this);
                var attribute_id = $attribute_el
                    .find("[data-oe-model='product.attribute']")
                    .data("oe-id");
                var attribute_value_id = combination_dict[attribute_id];
                $attribute_el
                    .find(variantsValuesSelectors.join(", "))
                    .each(function () {
                        var $value_el = $(this);
                        if (this.type === "radio") {
                            if ($value_el.val() === attribute_value_id.toString()) {
                                // This is the correct value for this attribute: check it
                                $value_el[0].checked = true;
                                $value_el.change();
                            }
                        } else if (this.type === "select-one") {
                            $value_el.val(attribute_value_id);
                            $value_el.change();
                        }
                    });
            });
            this.triggerVariantChange($container);
        },

        _getCombinationInfo: function (ev) {
            var $container = $(ev.target).closest(".js_product");
            var variant_reference_node = $container
                .parents("#product_details")
                .find(".js_variant_reference_displayed")
                .first();
            if (variant_reference_node && variant_reference_node[0] === ev.target) {
                // Another reference has been selected:
                // change selected attribute values accordingly
                var selected_combination_str = variant_reference_node
                    .find(":selected")
                    .data("combination");

                var selected_combination_dict = JSON.parse(
                    // Substitute single with double quotes
                    // so that JSON can parse the combination
                    selected_combination_str.replace(/'/g, '"')
                );

                this._setReferenceDisplayedCombination(
                    $container,
                    selected_combination_dict
                );
            }
            return this._super.apply(this, arguments);
        },

        _onChangeCombination: function (ev, $parent, combination) {
            var result = this._super.apply(this, arguments);

            // Dynamically update the variant_reference,
            // and hide it when empty
            var variant_id = combination.product_id;
            var variant_reference_node = $parent
                .parents("#product_details")
                .find(".js_variant_reference_displayed")
                .first();
            if (variant_reference_node) {
                variant_reference_node.val(variant_id);

                var variant_reference_parent_node = variant_reference_node.parents(
                    ".js_variant_reference_displayed_parent"
                );
                if (variant_id) {
                    variant_reference_parent_node.removeClass("d-none");
                } else {
                    variant_reference_parent_node.addClass("d-none");
                }
            }
            return result;
        },
    });
});
