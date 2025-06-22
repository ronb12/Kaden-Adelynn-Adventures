const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#222',
    parent: 'gameContainer',
    scene: [MenuScene, PlayScene],
    physics: { default: 'arcade', arcade: { gravity: { y: 0 }, debug: false } }
};

let game = new Phaser.Game(config);

function MenuScene() {
    Phaser.Scene.call(this, { key: 'MenuScene' });
}
MenuScene.prototype = Object.create(Phaser.Scene.prototype);
MenuScene.prototype.constructor = MenuScene;
MenuScene.prototype.preload = function() {};
MenuScene.prototype.create = function() {
    this.add.text(400, 180, 'Kaden & Adelynn Adventures', { font: '32px Arial', fill: '#fff' }).setOrigin(0.5);
    this.add.text(400, 250, 'Press SPACE to Start', { font: '24px Arial', fill: '#ffd700' }).setOrigin(0.5);
    this.input.keyboard.once('keydown-SPACE', () => {
        this.scene.start('PlayScene');
    });
};

function PlayScene() {
    Phaser.Scene.call(this, { key: 'PlayScene' });
    this.player = null;
    this.cursors = null;
    this.score = 0;
    this.scoreText = null;
    this.timer = 60;
    this.timerText = null;
    this.coins = null;
    this.sharks = null;
    this.coinTimer = 0;
    this.sharkTimer = 0;
}
PlayScene.prototype = Object.create(Phaser.Scene.prototype);
PlayScene.prototype.constructor = PlayScene;
PlayScene.prototype.preload = function() {};
PlayScene.prototype.create = function() {
    this.score = 0;
    this.timer = 60;
    this.add.text(400, 40, 'Kaden & Adelynn Adventures', { font: '28px Arial', fill: '#fff' }).setOrigin(0.5);
    this.scoreText = this.add.text(20, 20, 'Score: 0', { font: '20px Arial', fill: '#ffd700' });
    this.timerText = this.add.text(650, 20, 'Time: 60', { font: '20px Arial', fill: '#ffd700' });
    this.player = this.add.text(400, 520, '🚀', { font: '48px Arial' }).setOrigin(0.5);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);
    this.cursors = this.input.keyboard.createCursorKeys();
    this.coins = this.physics.add.group();
    this.sharks = this.physics.add.group();
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);
    this.physics.add.overlap(this.player, this.sharks, this.hitShark, null, this);
    this.time.addEvent({ delay: 1000, callback: this.updateTimer, callbackScope: this, loop: true });
};
PlayScene.prototype.update = function(time, delta) {
    this.player.body.setVelocity(0);
    if (this.cursors.left.isDown) this.player.body.setVelocityX(-300);
    if (this.cursors.right.isDown) this.player.body.setVelocityX(300);
    if (this.cursors.up.isDown) this.player.body.setVelocityY(-300);
    if (this.cursors.down.isDown) this.player.body.setVelocityY(300);
    // Spawn coins
    this.coinTimer += delta;
    if (this.coinTimer > 1200) {
        let x = Phaser.Math.Between(40, 760);
        let coin = this.add.text(x, 0, '🪙', { font: '36px Arial' }).setOrigin(0.5);
        this.physics.add.existing(coin);
        coin.body.setVelocityY(150);
        this.coins.add(coin);
        this.coinTimer = 0;
    }
    // Spawn sharks
    this.sharkTimer += delta;
    if (this.sharkTimer > 2500) {
        let x = Phaser.Math.Between(40, 760);
        let shark = this.add.text(x, 0, '🦈', { font: '36px Arial' }).setOrigin(0.5);
        this.physics.add.existing(shark);
        shark.body.setVelocityY(180);
        this.sharks.add(shark);
        this.sharkTimer = 0;
    }
    // Remove off-screen coins/sharks
    this.coins.children.iterate(c => { if (c && c.y > 650) c.destroy(); });
    this.sharks.children.iterate(s => { if (s && s.y > 650) s.destroy(); });
};
PlayScene.prototype.collectCoin = function(player, coin) {
    coin.destroy();
    this.score += 10;
    this.scoreText.setText('Score: ' + this.score);
};
PlayScene.prototype.hitShark = function(player, shark) {
    this.scene.start('MenuScene');
};
PlayScene.prototype.updateTimer = function() {
    this.timer--;
    this.timerText.setText('Time: ' + this.timer);
    if (this.timer <= 0) {
        this.scene.start('MenuScene');
    }
}; 