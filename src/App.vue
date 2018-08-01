<template>
    <div id="app">

        <div class="scoreboard" :class="{ fullScreen: 'full-screen' }">
            <template v-if="teams.length > 0">

                <h1>Scoreboard</h1>

                <div class="teams">
                    <div class="team" v-for="team in teams">
                        <div><img :src="team.img" :title="team.name"></div>
                        <div class="score">{{ team.score }}</div>
                        <div>
                            <a href="#" @click.prevent="incrementScore(team.id)">+</a>
                            <a href="#" @click.prevent="decrementScore(team.id)">-</a>
                        </div>
                    </div>
                </div>
            </template>

            <div class="form" v-if="enableForm">
                <input v-model="newTeamName"
                       @keyup.enter.native="addTeam()"
                       placeholder="Team name">

                <web-cam v-if="!img"
                         ref="webcam"
                         :deviceId="deviceId"
                         @cameras="onCameras"
                         width="250px"
                         height="188px"></web-cam>

                <img v-else
                     :src="img"/>

                <button v-if="!img"
                        type="button"
                        class="capture"
                        @click="capture">Capture Photo
                </button>

                <button v-else
                        type="button"
                        class="capture"
                        @click="resetImage">Take again
                </button>

                <button @click="addTeam()" v-if="img && validNewTeamName && uniqueNewTeamName">Add Team</button>
                <p class="error" v-if="error">{{ error }}</p>

                <a @click.prevent="hideForm">Hide form</a>
            </div>
            <template v-else>
                <a @click.prevent="showForm">Show form</a>
            </template>
        </div>

    </div>
</template>

<script>

    import _ from "lodash";

    export default {
        name: 'app',
        beforeCreate() {
            if (window.localStorage.taskmasterTeams && !confirm("Local storage data found - reload?")) {
                delete window.localStorage.taskmasterTeams;
            }
        },
        created() {
            this.debouncedSort = _.debounce(this.sortTeams, 2000);
        },
        mounted() {
            this.sortTeams();
        },
        data() {
            return {
                teams: window.localStorage.taskmasterTeams ? JSON.parse(window.localStorage.taskmasterTeams) : [],
                newTeamName: "",
                error: "",
                img: null,
                enableForm: true,
                deviceId: null,
                captured: false
            }
        },
        watch: {
            teams() {
                window.localStorage.taskmasterTeams = JSON.stringify(this.teams);
            },
            img() {
                if (this.img === null) {
                    this.$nextTick(() => {
                        this.$refs.webcam.start();
                    });
                }
            }
        },
        computed: {
            validNewTeamName() {
                return this.newTeamName.length >= 3;
            },
            uniqueNewTeamName() {
                return this.teams.filter(team => team.name.toLowerCase() === this.newTeamName.toLowerCase()).length === 0;
            },
            fullScreen() {
                return !this.enableForm;
            }
        },
        methods: {
            showForm() {
                this.enableForm = true;
            },
            hideForm() {
                this.enableForm = false;
            },
            sortTeams() {
                this.teams = this.teams.sort((a, b) => {
                    return a.score < b.score;
                });
            },
            addTeam() {
                this.error = "";

                if (!this.img) {
                    this.error = "Please take a team photo";
                    return;
                }

                if (!this.validNewTeamName) {
                    this.error = "Team name must be at least 3 chars";
                    return;
                }

                if (!this.uniqueNewTeamName) {
                    this.error = "Team name is not unique";
                    return;
                }

                this.teams.push({
                    id: this.teams.length + 1,
                    name: this.newTeamName,
                    img: this.img,
                    score: 0
                });

                this.img = null;
                this.newTeamName = "";
            },
            incrementScore(teamId) {
                this.teams.filter(team => team.id === teamId).map(team => team.score++);
                this.debouncedSort();
            },
            decrementScore(teamId) {
                this.teams.filter(team => team.id === teamId).map(team => team.score--);
                this.debouncedSort();
            },
            capture() {
                this.img = this.$refs.webcam.capture();
            },
            resetImage() {
                this.img = null;
            },
            onCameras(cameras) {
                this.deviceId = cameras[0].deviceId;
            },
        }
    }
</script>

<style lang="scss">
    #app {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;

        height: 0;
        padding-bottom: 56.25%; /* 16:9 */
        position: relative;
    }

    h1 {
        font-family: 'Lucida Sans Typewriter', sans-serif;
        font-weight: normal;
        color: #a21a03;
        font-size: 5rem;
    }

    a {
        color: #ffa924;
        cursor: pointer;
    }

    .scoreboard {
        width: 60%;
        margin: 0 auto;
    }

    .scoreboard.full-screen {
        height: 100%;
    }

    .teams {
        display: flex;
        flex-direction: column;
    }

    .team {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        justify-content: space-around;;
        align-items: center;

        a {
            text-decoration: none;
        }

        a:hover {
            text-decoration: dashed;
        }

        font-size: 3rem;

        .score {
            width: 200px;
        }

        img {
            width: 100px;
            height: 75px;
        }
    }

    .form {
        width: 400px;
        margin-left: auto;
        margin-right: 40%;
        display: flex;
        flex-direction: column;
    }

    .form input {
        width: 200px;
        border-radius: 2px;
        border: 1px solid black;
        padding: 4px 4px;
        margin-bottom: 5px;
    }

    .form button {
        width: 100px;
        border-radius: 5px;
        border: 1px solid black;
        color: white;
        background-color: #a21a03;
        cursor: pointer;
        height: 30px;
    }

    .form button.capture {
        background-color: #ffa924;
        margin-bottom: 5px;
    }

    .form button:hover {
        background-color: #e41903;
    }

    .form button.capture:hover {
        background-color: #ffe62d;
    }

    .error {
        color: red;
    }
</style>
