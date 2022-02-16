export default {
    name: 'SaDialogCommon',
    props: {
        title: {
            type: String,
        },
    },
    data() {
        return {
            _state: {
            },
            d_visible: false,
            d_size: '',
            d_title: '',
        };
    },
    watch: {
        title(val) {
            this.d_title = val;
        },
    },
    created() {

    },
    methods: {
        show() {
            this.d_visible = true;
            const p = new Promise((resolve, reject) => {
                this.resolve = resolve;
                this.reject = reject;
            });
            return p;
        },
        hide() {
            this.d_visible = false;
        },
        setTitle(val) {
            this.d_title = val;
        },
        open() {
            this.resolve && this.resolve();
        },
        opened() {
        },
        close() {
        },
        closed() {
        },
        handleCancel() {
            this.hide();
        },
        handleSure() {
            this.$emit('dialogSure');
        },
        setCustomState(val) {
            this._state = val;
        },
        getCustomState() {
            return this._state;
        },
    },
    // eslint-disable-next-line no-unused-vars
    render(h) {
        const self = this;
        const { d_visible, d_title, d_size } = this;
        return (<sa-dialog
            {...{
                props: {
                    visible: d_visible,
                    title: d_title,
                    size: d_size,
                    'destroy-on-close': true,
                    'append-to-body': true,
                },
                on: {
                    'update:visible'(val) {
                        self.d_visible = val;
                    },
                    open() {
                        self.open();
                    },
                    opened() {
                        self.opened();
                    },
                    close() {
                        self.close();
                    },
                    closed() {
                        self.closed();
                    },
                },
            }}
        >
            {
                this.$slots.default
            }
            <span slot="footer">
                <sa-button {...{
                    on: {
                        click() {
                            self.handleCancel();
                        },
                    },
                }}>取消</sa-button>
                <sa-button type="primary" {...{
                    on: {
                        click() {
                            self.handleSure();
                        },
                    },
                }}>确定</sa-button>
            </span>
        </sa-dialog>);
    },
};
