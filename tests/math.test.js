import {fahrenheitToCelsius, celsiusToFahrenheit} from './math.js'

test('Should convert 32 F to 0 C', () => {
    const temp = fahrenheitToCelsius(32)
    expect(temp).toBe(0)
})

test('Should convert 0 C to 32 F', () => {
    const temp = celsiusToFahrenheit(0)
    expect(temp).toBe(32)
})


test('Async code', (param) => {
    setTimeout(() => {
        expect(1).toBe(1)
        param()
    }, 2000)
})


const add = async(a, b) => {
    return a + b;
}

test('add', async () => {
    const sum = await add(2, 3)
    expect(sum).toBe(5)
})