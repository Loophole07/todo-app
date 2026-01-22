export const validateTodo = (todo) => {
  const errors = {}

  if (!todo.title || todo.title.trim() === '') {
    errors.title = 'Title is required'
  }

  if (!todo.startDate) {
    errors.startDate = 'Start date is required'
  }

  if (!todo.endDate) {
    errors.endDate = 'Expected date is required'
  }

  if (todo.startDate && todo.endDate) {
    if (new Date(todo.startDate) > new Date(todo.endDate)) {
      errors.date = 'End date must be after start date'
    }
  }

  return errors
}
