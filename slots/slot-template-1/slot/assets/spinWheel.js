document.addEventListener('DOMContentLoaded', () => {
	const spinButton = document.getElementById('go-btn')
	const winSector = document.getElementById('win-sector-animation')
	const logo = document.querySelector('.logo')
	const bottomSection = document.querySelector('.bottom__section')
	const leftPerson = document.querySelector('.left-person')
	const wheel = document.querySelector('.wheel')
	const wheelSpinner = document.getElementById('wheel-spinner')
	const modal = document.getElementById('modal')
	const winButton = document.getElementById('win-button-modal')
	const modalTitle = modal.querySelector('.modal__title span')
	const modalText = modal.querySelector('.modal__text span')
	const effectsContainer = document.querySelector('.effects')
	const effectsImage = document.getElementById('effects-image')

	const rewards = [
		'Промо-код на скидку',
		'Бесплатный бонус',
		'Попробуй снова',
		'Секретный подарок',
		'0 ₽ 😢',
		'Удача завтра',
		'🎁 Сюрприз',
		'💎 Джекпот!',
	]

	let isSpinning = false

	function spinWheel() {
		if (isSpinning) return
		const clickButton = new Audio('./assets/sounds/button-124476.mp3')

		const clickSound = new Audio(
			'./assets/sounds/wheel-spin-click-slow-down-101152.mp3'
		)

		const winSounds = new Audio('./assets/sounds/you-win-sequence-1-183948.mp3')

		clickButton.play()

		isSpinning = true
		spinButton.disabled = true

		const className = `wheel__spinner_win_${1}`
		const reward = rewards[1]

		// новая анимация
		wheelSpinner.classList.add(className)
		wheelSpinner.classList.remove('wheel__spinner_animated')

		clickSound.play()

		setTimeout(() => {
			winSector.classList.add('is--active')
			winSounds.play()
		}, 3200)

		setTimeout(() => {
			showModal(reward)
			showEffects()
			wheel.classList.add('hidden')
			logo.classList.add('hidden')
			leftPerson.classList.add('hidden')
			bottomSection.classList.add('hidden')
			isSpinning = false
			spinButton.disabled = false
		}, 4700)
	}

	function showModal(text) {
		modalTitle.textContent = 'Вы выиграли!'
		modalText.textContent = text
		modal.classList.add('is--active')
	}

	function showEffects() {
		effectsContainer.classList.remove('hidden')
		effectsImage.classList.remove('hidden')
		effectsContainer.classList.add('effects__block')

		setTimeout(() => {
			effectsContainer.classList.remove('effects__block')
			effectsContainer.classList.add('hidden')
			effectsImage.classList.add('hidden')
		}, 2000)
	}

	spinButton.addEventListener('click', spinWheel)
})
