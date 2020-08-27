<script>
    import { PageConfig, updateConfig } from "../User/Stores/PageConfigStore";
    export let User;
    const Config = { ...$PageConfig };
    const applyChanges = () => {
        updateConfig(Config);
    };
</script>

<style>
    #user-label {
        cursor: pointer;
        align-self: center;
        margin-right: 5px;
        height: 32px;
    }
    #show-config:checked + #user-config {
        visibility: visible;
        opacity: 1;
    }

    #show-config {
        display: none;
    }

    #user-config {
        visibility: hidden;
        opacity: 0;
        position: absolute;
        top: 44px;
        right: calc(100% - 36px);
        width: max-content;
        border-radius: 0.25rem;
        border: 1px solid;
        transition: 0.3s all;
        z-index: 2;
        color: black;
        background: rgb(221, 170, 94);
    }

    #config-content {
        padding: 5px 10px;
    }

    #config-content * {
        font-size: 0.95rem;
    }
    #user-config > div:first-child {
        padding: 5px;
        text-align: center;
    }

    #user-config > div:first-child span {
        cursor: pointer;
    }

    #user-config:after {
        position: absolute;
        top: -10.6px;
        right: 14.5px;
        content: " ";
        height: 20px;
        width: 20px;
        background-color: inherit;
        transform: rotate(45deg);
        z-index: -1;
        border-top: 1px solid;
        border-left: 1px solid;
    }
    .input-group {
        position: relative;
        margin-bottom: 5px;
    }
    .input-group label {
        display: inline-block;
        text-align: right;
        width: 105px;
        cursor: initial;
        padding: 0.375rem 0.5rem;
    }

    #fpp-tips {
        position: absolute;
        display: none;
        min-width: max-content;
        background-color: teal;
        padding: 2px 5px;
        border-radius: 0.25rem;
        right: 0%;
        top: -35px;
        z-index: 3;
        -webkit-appearance: none;
    }

    #fpp-tips:after {
        content: " ";
        position: absolute;
        display: inline-block;
        width: 15px;
        height: 15px;
        background-color: teal;
        transform: rotate(45deg);
        right: 40%;
        bottom: -7.5px;
        z-index: -1;
    }

    #items:hover + span {
        display: inline-block;
    }
    #user-config div:last-child {
        text-align: center;
    }
    #orderby,
    option {
        font-family: "Font Awesome 5 Free", "sans-serif";
        font-weight: 600;
    }
    @media screen and (max-width: 480px) {
        #user-config.user-config {
            top: 73px;
            right: 23px;
        }
        #user-label.User {
            height: initial;
            text-align: center;
        }

        #user-label span {
            display: inline-block;
            height: 26px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        #user-label.User {
            max-width: 100px;
        }

        #user-label.Administrator span {
            width: 120px;
            height: 22px;
        }

        @media screen and (max-width: 430px) {
            #user-config.admin-config {
                top: 71px;
                left: 0;
            }
        }
    }
</style>

<label id="user-label" class={User.role} for="show-config">
    <i class="fas fa-user-cog" />
    <span>{User.username}</span>
</label>
<input type="checkbox" name="" id="show-config" />
<div id="user-config" class={User.role.includes('User') ? 'user-config' : 'admin-config'}>
    <div>
        <span on:click>
            <i class="fas fa-sign-out-alt" />
            Log out
        </span>
    </div>
    {#if !User.role.includes('Administrator')}
        <div id="config-content">
            <div class="input-group">
                <div class="input-group-prepend">
                    <label class="input-group-text">Sort By:</label>
                </div>
                <select id="orderby" class="form-control fa" bind:value={Config.order}>
                    <option value="nu">&#xf15d; Name</option>
                    <option value="nd">&#xf15e; Name</option>
                    <option value="du">&#xf162; Date</option>
                    <option value="dd">&#xf163; Date</option>
                </select>
            </div>
            <div class="input-group">
                <div class="input-group-prepend">
                    <label class="input-group-text">File per Page:</label>
                </div>
                <input
                    id="items"
                    type="number"
                    min="0"
                    max="500"
                    bind:value={Config.items}
                    class="form-control" />
                <span id="fpp-tips">0 = auto, max 500</span>
            </div>
            <div class="bottom-controls">
                <span id="btn-save" class="btn" on:click={applyChanges}>Save</span>
            </div>
        </div>
    {/if}
</div>
