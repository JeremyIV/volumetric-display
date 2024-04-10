function test_pattern() {
  for (let index = 0; index < color_data.length; index++) {
    color_data[index] += (0.1 * index) / color_data.length;
    if (color_data[index] > 1) {
      color_data[index] = 0;
    }
  }
  return color_data;
}
